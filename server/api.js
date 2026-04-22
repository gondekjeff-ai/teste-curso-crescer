import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multipart from '@fastify/multipart';
import { authHook, JWT_SECRET } from './auth.js';

/**
 * Generic error wrapper: logs full error server-side, returns generic message to client.
 */
function safeError(reply, err, log, status = 500, publicMsg = 'Erro interno do servidor') {
  log.error({ err: err?.message, stack: err?.stack }, 'API error');
  return reply.code(status).send({ message: publicMsg });
}

/**
 * Registers all API routes on a Fastify instance.
 * @param {import('fastify').FastifyInstance} app
 * @param {{ pool: import('pg').Pool }} opts
 */
export async function registerApiRoutes(app, opts) {
  const { pool } = opts;

  // Multipart for /admin/upload (file size limit 10MB)
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  });

  // Hook factory: requires admin role
  const requireAdmin = async (req, reply) => {
    try {
      const { rows } = await pool.query(
        'SELECT role FROM user_roles WHERE user_id = $1 AND role = $2',
        [req.user.id, 'admin']
      );
      if (rows.length === 0) return reply.code(403).send({ message: 'Acesso negado' });
    } catch (err) {
      return safeError(reply, err, app.log, 500, 'Erro ao validar permissões');
    }
  };

  // =================== AUTH ===================

  app.post('/auth/login', async (req, reply) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return reply.code(400).send({ message: 'Email e senha obrigatórios' });

      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (rows.length === 0) return reply.code(401).send({ message: 'Credenciais inválidas' });

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return reply.code(401).send({ message: 'Credenciais inválidas' });

      const { rows: roles } = await pool.query(
        'SELECT role FROM user_roles WHERE user_id = $1 AND role = $2',
        [user.id, 'admin']
      );
      const isAdmin = roles.length > 0;
      if (!isAdmin) return reply.code(403).send({ message: 'Acesso negado' });

      const { rows: profiles } = await pool.query(
        'SELECT mfa_enabled FROM profiles WHERE user_id = $1', [user.id]
      );
      if (profiles[0]?.mfa_enabled) {
        const mfaToken = jwt.sign(
          { id: user.id, email: user.email, mfa_pending: true },
          JWT_SECRET,
          { expiresIn: '5m' }
        );
        return reply.send({ requiresMfa: true, mfaToken });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      return reply.send({ token, user: { id: user.id, email: user.email }, isAdmin: true });
    } catch (err) {
      return safeError(reply, err, app.log);
    }
  });

  app.post('/auth/verify-mfa', async (req, reply) => {
    try {
      const { mfaToken, code } = req.body || {};
      let decoded;
      try { decoded = jwt.verify(mfaToken, JWT_SECRET); }
      catch { return reply.code(401).send({ message: 'Token MFA expirado' }); }
      if (!decoded.mfa_pending) return reply.code(400).send({ message: 'Token inválido' });

      const { rows } = await pool.query(
        'SELECT mfa_secret FROM profiles WHERE user_id = $1', [decoded.id]
      );
      if (rows.length === 0 || !rows[0].mfa_secret) {
        return reply.code(400).send({ message: 'MFA não configurado' });
      }

      const { authenticator } = await import('otplib');
      if (!authenticator.check(code, rows[0].mfa_secret)) {
        return reply.code(401).send({ message: 'Código MFA inválido' });
      }

      const { rows: roles } = await pool.query(
        'SELECT role FROM user_roles WHERE user_id = $1 AND role = $2',
        [decoded.id, 'admin']
      );
      const isAdmin = roles.length > 0;

      const token = jwt.sign({ id: decoded.id, email: decoded.email }, JWT_SECRET, { expiresIn: '24h' });
      return reply.send({ token, user: { id: decoded.id, email: decoded.email }, isAdmin });
    } catch (err) {
      return safeError(reply, err, app.log);
    }
  });

  app.get('/auth/me', { preHandler: authHook }, async (req, reply) => {
    try {
      const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.user.id]);
      if (rows.length === 0) return reply.code(404).send({ message: 'Usuário não encontrado' });
      const { rows: roles } = await pool.query(
        'SELECT role FROM user_roles WHERE user_id = $1', [req.user.id]
      );
      return reply.send({ user: rows[0], isAdmin: roles.some(r => r.role === 'admin') });
    } catch (err) {
      return safeError(reply, err, app.log);
    }
  });

  app.post('/setup', async (req, reply) => {
    try {
      const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
      if (parseInt(rows[0].count) > 0) {
        return reply.code(400).send({ message: 'Setup já realizado. Usuários já existem.' });
      }
      const { email, password } = req.body || {};
      if (!email || !password) return reply.code(400).send({ message: 'Email e senha obrigatórios' });
      const hash = await bcrypt.hash(password, 12);
      const { rows: [user] } = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, hash]
      );
      await pool.query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2)', [user.id, 'admin']);
      await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [user.id]);
      return reply.send({ message: 'Admin criado com sucesso', user });
    } catch (err) {
      return safeError(reply, err, app.log);
    }
  });

  // =================== PUBLIC ===================

  app.get('/news', async (req, reply) => {
    const limit = parseInt(req.query?.limit) || 20;
    const { rows } = await pool.query(
      'SELECT id, title, content, excerpt, image_url, created_at FROM news WHERE published = true ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return rows;
  });

  app.get('/news/:id', async (req, reply) => {
    const { rows } = await pool.query(
      'SELECT id, title, content, excerpt, image_url, created_at FROM news WHERE id = $1 AND published = true',
      [req.params.id]
    );
    if (rows.length === 0) return reply.code(404).send({ message: 'Notícia não encontrada' });
    return rows[0];
  });

  app.get('/products', async () => {
    const { rows } = await pool.query(
      'SELECT id, name, description, category, price FROM products WHERE active = true ORDER BY name'
    );
    return rows;
  });

  app.get('/carousel', async () => {
    const { rows } = await pool.query(
      'SELECT id, image_url, alt_text, display_order FROM carousel_images WHERE active = true ORDER BY display_order'
    );
    return rows;
  });

  app.get('/popups', async () => {
    const { rows } = await pool.query(
      'SELECT id, image_url, text, display_order FROM index_popup WHERE active = true ORDER BY display_order'
    );
    return rows;
  });

  app.get('/site-content/:section', async (req) => {
    const { rows } = await pool.query(
      'SELECT content FROM site_content WHERE section = $1', [req.params.section]
    );
    return rows.length === 0 ? { content: null } : rows[0];
  });

  app.post('/contacts', async (req) => {
    const { name, email, message } = req.body || {};
    await pool.query('INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)', [name, email, message]);
    return { success: true };
  });

  app.post('/orders', async (req) => {
    const { name, email, services, implementation_deadline } = req.body || {};
    await pool.query(
      'INSERT INTO orders (name, email, services, implementation_deadline) VALUES ($1, $2, $3, $4)',
      [name, email, services, implementation_deadline]
    );
    return { success: true };
  });

  app.post('/page-views', async (req) => {
    const { page_path } = req.body || {};
    await pool.query('INSERT INTO page_views (page_path) VALUES ($1)', [page_path]);
    return { success: true };
  });

  app.post('/send-contact-email', async (req) => {
    const { name, email, message } = req.body || {};
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return { success: true };
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'OptiStrat <noreply@optistrat.com.br>',
          to: ['comercial@optistrat.com.br'],
          subject: `Novo contato: ${name}`,
          html: `<h2>Novo Contato</h2><p><strong>Nome:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Mensagem:</strong> ${message}</p>`,
        }),
      });
    } catch (e) { app.log.error({ err: e }, 'send-contact-email'); }
    return { success: true };
  });

  app.post('/send-order-email', async (req) => {
    const { name, email, services, implementation_deadline } = req.body || {};
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return { success: true };
    try {
      const servicesList = Array.isArray(services) ? services.join(', ') : services;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'OptiStrat <noreply@optistrat.com.br>',
          to: ['comercial@optistrat.com.br'],
          subject: `Novo Orçamento: ${name}`,
          html: `<h2>Novo Orçamento</h2><p><strong>Nome:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Serviços:</strong> ${servicesList}</p><p><strong>Prazo:</strong> ${implementation_deadline}</p>`,
        }),
      });
    } catch (e) { app.log.error({ err: e }, 'send-order-email'); }
    return { success: true };
  });

  // Streaming chatbot (Fastify supports raw stream via reply.raw)
  app.post('/chatbot', async (req, reply) => {
    const { message } = req.body || {};
    try {
      await pool.query('INSERT INTO chatbot_interactions (user_message) VALUES ($1)', [message]);
    } catch (e) { app.log.error({ err: e }, 'chatbot insert'); }

    reply.hijack();
    const raw = reply.raw;
    raw.setHeader('Content-Type', 'text/event-stream');
    raw.setHeader('Cache-Control', 'no-cache');
    raw.setHeader('Connection', 'keep-alive');

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Chatbot não configurado. Entre em contato pelo email comercial@optistrat.com.br' } }] })}\n\n`);
      raw.write('data: [DONE]\n\n');
      return raw.end();
    }

    try {
      const [productsResult, newsResult] = await Promise.all([
        pool.query("SELECT name, description, category FROM products WHERE active = true LIMIT 10"),
        pool.query("SELECT title, excerpt FROM news WHERE published = true ORDER BY created_at DESC LIMIT 5"),
      ]);

      let contextInfo = '';
      if (productsResult.rows.length > 0) {
        contextInfo += '\n\nProdutos e Serviços Disponíveis:\n';
        productsResult.rows.forEach(p => { contextInfo += `- ${p.name} (${p.category}): ${p.description}\n`; });
      }
      if (newsResult.rows.length > 0) {
        contextInfo += '\n\nNotícias Recentes:\n';
        newsResult.rows.forEach(n => { contextInfo += `- ${n.title}: ${n.excerpt || ''}\n`; });
      }

      const systemPrompt = `Você é o assistente virtual da OptiStrat, empresa de gestão de TI e telecomunicações. Responda em português do Brasil de forma amigável e profissional. Ajude com informações sobre os serviços: consultoria em TI, gerenciamento de redes, segurança cibernética, cloud computing, backup automático, suporte técnico 24h, desenvolvimento de software e infraestrutura de TI. Para contato direto: comercial@optistrat.com.br. NUNCA informe valores ou preços - direcione para /orcamento.${contextInfo}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Erro ao processar mensagem. Tente novamente.' } }] })}\n\n`);
        raw.write('data: [DONE]\n\n');
        return raw.end();
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw.write(decoder.decode(value, { stream: true }));
      }
      raw.end();
    } catch (e) {
      app.log.error({ err: e }, 'chatbot stream');
      try {
        raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Erro ao processar mensagem.' } }] })}\n\n`);
        raw.write('data: [DONE]\n\n');
      } catch {}
      raw.end();
    }
  });

  // =================== MEDIA ===================

  app.get('/media/:id', async (req, reply) => {
    const { rows } = await pool.query(
      'SELECT data, mime_type, filename FROM media WHERE id = $1', [req.params.id]
    );
    if (rows.length === 0) return reply.code(404).send({ message: 'Arquivo não encontrado' });
    const media = rows[0];
    reply
      .header('Content-Type', media.mime_type)
      .header('Content-Disposition', `inline; filename="${media.filename}"`)
      .header('Cache-Control', 'public, max-age=604800');
    return reply.send(media.data);
  });

  // =================== ADMIN CRUD ===================
  const adminGuard = { preHandler: [authHook, requireAdmin] };

  // News
  app.get('/admin/news', adminGuard, async () => {
    const { rows } = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    return rows;
  });
  app.post('/admin/news', adminGuard, async (req) => {
    const { title, content, excerpt, image_url, published } = req.body || {};
    const { rows } = await pool.query(
      'INSERT INTO news (title, content, excerpt, image_url, published) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, excerpt || null, image_url || null, published || false]
    );
    return rows[0];
  });
  app.put('/admin/news/:id', adminGuard, async (req) => {
    const { title, content, excerpt, image_url, published } = req.body || {};
    const { rows } = await pool.query(
      'UPDATE news SET title=$1, content=$2, excerpt=$3, image_url=$4, published=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [title, content, excerpt, image_url, published, req.params.id]
    );
    return rows[0];
  });
  app.delete('/admin/news/:id', adminGuard, async (req) => {
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    return { success: true };
  });

  // Products
  app.get('/admin/products', adminGuard, async () => {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY name');
    return rows;
  });
  app.post('/admin/products', adminGuard, async (req) => {
    const { name, description, category, price, active } = req.body || {};
    const { rows } = await pool.query(
      'INSERT INTO products (name, description, category, price, active) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, description || null, category || null, price || null, active !== false]
    );
    return rows[0];
  });
  app.put('/admin/products/:id', adminGuard, async (req) => {
    const { name, description, category, price, active } = req.body || {};
    const { rows } = await pool.query(
      'UPDATE products SET name=$1, description=$2, category=$3, price=$4, active=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [name, description, category, price, active, req.params.id]
    );
    return rows[0];
  });
  app.delete('/admin/products/:id', adminGuard, async (req) => {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    return { success: true };
  });

  // Carousel
  app.get('/admin/carousel', adminGuard, async () => {
    const { rows } = await pool.query('SELECT * FROM carousel_images ORDER BY display_order');
    return rows;
  });
  app.post('/admin/carousel', adminGuard, async (req) => {
    const { image_url, alt_text, display_order, active } = req.body || {};
    const { rows } = await pool.query(
      'INSERT INTO carousel_images (image_url, alt_text, display_order, active) VALUES ($1,$2,$3,$4) RETURNING *',
      [image_url, alt_text || 'Imagem do carrossel', display_order || 0, active !== false]
    );
    return rows[0];
  });
  app.put('/admin/carousel/:id', adminGuard, async (req, reply) => {
    const updates = req.body || {};
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      if (['image_url', 'alt_text', 'display_order', 'active'].includes(key)) {
        fields.push(`${key} = $${idx}`); values.push(value); idx++;
      }
    }
    if (fields.length === 0) return reply.code(400).send({ message: 'Nenhum campo para atualizar' });
    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE carousel_images SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    return rows[0];
  });
  app.delete('/admin/carousel/:id', adminGuard, async (req) => {
    await pool.query('DELETE FROM carousel_images WHERE id = $1', [req.params.id]);
    return { success: true };
  });

  // Popups
  app.get('/admin/popups', adminGuard, async () => {
    const { rows } = await pool.query('SELECT * FROM index_popup ORDER BY display_order');
    return rows;
  });
  app.post('/admin/popups', adminGuard, async (req) => {
    const { image_url, text, display_order, active } = req.body || {};
    const { rows } = await pool.query(
      'INSERT INTO index_popup (image_url, text, display_order, active) VALUES ($1,$2,$3,$4) RETURNING *',
      [image_url || null, text || null, display_order || 0, active !== false]
    );
    return rows[0];
  });
  app.put('/admin/popups/:id', adminGuard, async (req) => {
    const { image_url, text, display_order, active } = req.body || {};
    const { rows } = await pool.query(
      'UPDATE index_popup SET image_url=$1, text=$2, display_order=$3, active=$4 WHERE id=$5 RETURNING *',
      [image_url, text, display_order, active, req.params.id]
    );
    return rows[0];
  });
  app.delete('/admin/popups/:id', adminGuard, async (req) => {
    await pool.query('DELETE FROM index_popup WHERE id = $1', [req.params.id]);
    return { success: true };
  });

  // Contacts
  app.get('/admin/contacts', adminGuard, async () => {
    const { rows } = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    return rows;
  });
  app.delete('/admin/contacts/:id', adminGuard, async (req) => {
    await pool.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    return { success: true };
  });

  // Orders
  app.get('/admin/orders', adminGuard, async () => {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
  });

  // Stats
  app.get('/admin/stats', adminGuard, async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [carousel, contacts, pageViews, chatbot, products, news, orders, pvData] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM carousel_images WHERE active = true"),
      pool.query("SELECT COUNT(*) as count FROM contacts"),
      pool.query("SELECT COUNT(*) as count FROM page_views WHERE created_at >= $1", [since]),
      pool.query("SELECT COUNT(*) as count FROM chatbot_interactions WHERE created_at >= $1", [since]),
      pool.query("SELECT COUNT(*) as count FROM products"),
      pool.query("SELECT COUNT(*) as count FROM news"),
      pool.query("SELECT COUNT(*) as count FROM orders"),
      pool.query("SELECT page_path FROM page_views WHERE created_at >= $1", [since]),
    ]);
    const pageCounts = {};
    pvData.rows.forEach(v => { pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1; });
    const topPages = Object.entries(pageCounts)
      .map(([page_path, views]) => ({ page_path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    return {
      carouselImages: parseInt(carousel.rows[0].count),
      contacts: parseInt(contacts.rows[0].count),
      pageViews: parseInt(pageViews.rows[0].count),
      chatbotInteractions: parseInt(chatbot.rows[0].count),
      products: parseInt(products.rows[0].count),
      news: parseInt(news.rows[0].count),
      orders: parseInt(orders.rows[0].count),
      topPages,
    };
  });

  // Site Content
  app.get('/admin/site-content/:section', adminGuard, async (req) => {
    const { rows } = await pool.query(
      'SELECT content FROM site_content WHERE section = $1', [req.params.section]
    );
    return rows.length === 0 ? { content: null } : rows[0];
  });
  app.put('/admin/site-content/:section', adminGuard, async (req) => {
    const { content } = req.body || {};
    const { rows } = await pool.query(
      'SELECT id FROM site_content WHERE section = $1', [req.params.section]
    );
    if (rows.length === 0) {
      await pool.query('INSERT INTO site_content (section, content) VALUES ($1, $2)',
        [req.params.section, JSON.stringify(content)]);
    } else {
      await pool.query('UPDATE site_content SET content = $1, updated_at = NOW() WHERE section = $2',
        [JSON.stringify(content), req.params.section]);
    }
    return { success: true };
  });

  // File Upload (multipart) — stored as BLOB
  app.post('/admin/upload', adminGuard, async (req, reply) => {
    try {
      const data = await req.file();
      if (!data) return reply.code(400).send({ message: 'Nenhum arquivo enviado' });
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm'];
      if (!allowed.includes(data.mimetype)) {
        return reply.code(400).send({ message: 'Tipo de arquivo não permitido' });
      }
      const buffer = await data.toBuffer();
      const folder = (data.fields?.folder?.value) || 'general';
      const { rows } = await pool.query(
        'INSERT INTO media (filename, mime_type, data, folder, size_bytes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [data.filename, data.mimetype, buffer, folder, buffer.length]
      );
      return { url: `/api/media/${rows[0].id}` };
    } catch (err) {
      return safeError(reply, err, app.log, 500, 'Falha no upload');
    }
  });

  app.get('/admin/media', adminGuard, async (req) => {
    const folder = req.query?.folder;
    let query = 'SELECT id, filename, mime_type, folder, size_bytes, created_at FROM media';
    const params = [];
    if (folder) { query += ' WHERE folder = $1'; params.push(folder); }
    query += ' ORDER BY created_at DESC LIMIT 100';
    const { rows } = await pool.query(query, params);
    return rows.map(r => ({ ...r, url: `/api/media/${r.id}` }));
  });
  app.delete('/admin/media/:id', adminGuard, async (req) => {
    await pool.query('DELETE FROM media WHERE id = $1', [req.params.id]);
    return { success: true };
  });

  // MFA
  app.get('/admin/profile/mfa', { preHandler: authHook }, async (req) => {
    const { rows } = await pool.query('SELECT mfa_enabled FROM profiles WHERE user_id = $1', [req.user.id]);
    return { mfaEnabled: rows[0]?.mfa_enabled || false };
  });
  app.post('/admin/mfa/setup', { preHandler: authHook }, async (req) => {
    const { authenticator } = await import('otplib');
    const secret = authenticator.generateSecret();
    await pool.query('UPDATE profiles SET mfa_secret = $1 WHERE user_id = $2', [secret, req.user.id]);
    const otpauthUrl = authenticator.keyuri(req.user.email, 'OptiStrat', secret);
    return { otpauthUrl };
  });
  app.post('/admin/mfa/enable', { preHandler: authHook }, async (req, reply) => {
    const { code } = req.body || {};
    const { rows } = await pool.query('SELECT mfa_secret FROM profiles WHERE user_id = $1', [req.user.id]);
    if (!rows[0]?.mfa_secret) return reply.code(400).send({ message: 'MFA não configurado' });
    const { authenticator } = await import('otplib');
    if (!authenticator.check(code, rows[0].mfa_secret)) return { valid: false };
    await pool.query('UPDATE profiles SET mfa_enabled = true WHERE user_id = $1', [req.user.id]);
    return { valid: true };
  });
  app.post('/admin/mfa/disable', { preHandler: authHook }, async (req) => {
    await pool.query('UPDATE profiles SET mfa_enabled = false, mfa_secret = NULL WHERE user_id = $1', [req.user.id]);
    return { success: true };
  });

  // Tech RSS
  app.post('/fetch-tech-news', adminGuard, async () => {
    const RSS_FEEDS = [
      'https://feeds.feedburner.com/tecmundo',
      'https://olhardigital.com.br/feed/',
      'https://canaltech.com.br/rss/',
    ];
    const parseRSS = (xml) => {
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
        const title = titleMatch ? titleMatch[1].trim() : '';
        const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
        const description = descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '').substring(0, 200) : '';
        const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
        const link = linkMatch ? linkMatch[1].trim() : '';
        if (title) items.push({ title, description, link });
      }
      return items;
    };
    let inserted = 0;
    for (const feedUrl of RSS_FEEDS) {
      try {
        const resp = await fetch(feedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!resp.ok) continue;
        const xml = await resp.text();
        const items = parseRSS(xml).slice(0, 10);
        for (const item of items) {
          const { rows: existing } = await pool.query('SELECT id FROM news WHERE title = $1', [item.title]);
          if (existing.length === 0) {
            await pool.query(
              'INSERT INTO news (title, content, excerpt, image_url, published) VALUES ($1, $2, $3, $4, true)',
              [item.title, item.description, item.description, item.link]
            );
            inserted++;
          }
        }
      } catch { /* skip failed feeds */ }
    }
    return { success: true, message: `${inserted} novas notícias importadas` };
  });
}