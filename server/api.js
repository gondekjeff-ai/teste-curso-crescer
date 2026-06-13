import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multipart from '@fastify/multipart';
import { authHook, JWT_SECRET } from './auth.js';

/** Escape user input before embedding in HTML email bodies. */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Strip CRLF from email header values (subject) to prevent header injection. */
function sanitizeHeader(value, max = 200) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, max);
}

/** Basic email format check. */
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

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
      // SECURITY: require a pre-shared SETUP_TOKEN to prevent any internet caller
      // from registering themselves as admin during the initial deployment window
      // or after an accidental users-table truncation.
      const SETUP_TOKEN = process.env.SETUP_TOKEN;
      if (!SETUP_TOKEN || SETUP_TOKEN.length < 16) {
        return reply.code(503).send({ message: 'Setup desabilitado. Configure SETUP_TOKEN no ambiente.' });
      }
      const provided = req.body?.setupToken || req.headers['x-setup-token'];
      if (provided !== SETUP_TOKEN) {
        return reply.code(403).send({ message: 'Token de setup inválido' });
      }

      const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
      if (parseInt(rows[0].count) > 0) {
        return reply.code(400).send({ message: 'Setup já realizado. Usuários já existem.' });
      }
      const { email, password } = req.body || {};
      if (!email || !password) return reply.code(400).send({ message: 'Email e senha obrigatórios' });
      if (!EMAIL_RE.test(email) || email.length > 255) {
        return reply.code(400).send({ message: 'Email inválido' });
      }
      if (typeof password !== 'string' || password.length < 12 || password.length > 200) {
        return reply.code(400).send({ message: 'Senha deve ter entre 12 e 200 caracteres' });
      }
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
      'SELECT id, title, content, excerpt, image_url, source_url, created_at FROM news WHERE published = true ORDER BY RANDOM() LIMIT $1',
      [limit]
    );
    return rows;
  });

  app.get('/news/:id', async (req, reply) => {
    const { rows } = await pool.query(
      'SELECT id, title, content, excerpt, image_url, source_url, created_at FROM news WHERE id = $1 AND published = true',
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

  app.get('/products/:id', async (req, reply) => {
    const { rows } = await pool.query(
      'SELECT id, name, description, category, price FROM products WHERE id = $1 AND active = true',
      [req.params.id]
    );
    if (rows.length === 0) return reply.code(404).send({ message: 'Produto não encontrado' });
    return rows[0];
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

  app.get('/testimonials', async () => {
    const { rows } = await pool.query(
      'SELECT id, opinion, person_name, company, display_order FROM testimonials WHERE active = true ORDER BY display_order, created_at DESC'
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
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const message = String(req.body?.message ?? '').trim();
    if (!name || name.length > 100) return { success: false, message: 'Nome inválido' };
    if (!EMAIL_RE.test(email) || email.length > 255) return { success: false, message: 'Email inválido' };
    if (!message || message.length > 5000) return { success: false, message: 'Mensagem inválida' };
    await pool.query('INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)', [name, email, message]);
    return { success: true };
  });

  app.post('/orders', async (req) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const servicesRaw = req.body?.services;
    const implementation_deadline = String(req.body?.implementation_deadline ?? '').trim().slice(0, 200);
    if (!name || name.length > 100) return { success: false, message: 'Nome inválido' };
    if (!EMAIL_RE.test(email) || email.length > 255) return { success: false, message: 'Email inválido' };
    let services = servicesRaw;
    if (Array.isArray(services)) {
      if (services.length > 20) return { success: false, message: 'Muitos serviços selecionados' };
      services = services.map((s) => String(s).slice(0, 200));
    } else if (typeof services === 'string') {
      services = services.slice(0, 4000);
    } else {
      services = '';
    }
    await pool.query(
      'INSERT INTO orders (name, email, services, implementation_deadline) VALUES ($1, $2, $3, $4)',
      [name, email, services, implementation_deadline]
    );
    return { success: true };
  });

  app.post('/page-views', async (req) => {
    let page_path = String(req.body?.page_path ?? '').trim();
    if (!page_path.startsWith('/') || page_path.length > 500) {
      return { success: false };
    }
    // Strip CR/LF and control chars
    page_path = page_path.replace(/[\r\n\t]/g, '');
    await pool.query('INSERT INTO page_views (page_path) VALUES ($1)', [page_path]);
    return { success: true };
  });

  // =================== CAREERS (public submit) ===================
  // Accepts multipart/form-data with PDF CV (max 5MB).
  app.post('/careers/apply', async (req, reply) => {
    try {
      if (!req.isMultipart()) {
        return reply.code(400).send({ message: 'Envio inválido' });
      }
      const fields = {};
      let cv = null;
      const parts = req.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          if (part.fieldname !== 'cv') {
            // Drain unknown files
            await part.toBuffer().catch(() => {});
            continue;
          }
          const buf = await part.toBuffer();
          if (buf.length > 5 * 1024 * 1024) {
            return reply.code(400).send({ message: 'O currículo deve ter no máximo 5MB' });
          }
          const mime = part.mimetype || '';
          const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(part.filename || '');
          if (!isPdf) {
            return reply.code(400).send({ message: 'O currículo deve estar no formato PDF' });
          }
          cv = { filename: part.filename || 'curriculo.pdf', mime: 'application/pdf', buffer: buf };
        } else {
          fields[part.fieldname] = typeof part.value === 'string' ? part.value : '';
        }
      }

      const full_name = (fields.full_name || '').trim();
      const city = (fields.city || '').trim();
      const state = (fields.state || '').trim().toUpperCase().slice(0, 2);
      const cep = (fields.cep || '').trim();
      const phone = (fields.phone || '').trim();
      const email = (fields.email || '').trim().toLowerCase();

      if (!full_name || full_name.length < 3 || full_name.length > 150)
        return reply.code(400).send({ message: 'Informe seu nome completo' });
      if (!city || city.length > 100)
        return reply.code(400).send({ message: 'Informe sua cidade' });
      if (!/^[A-Z]{2}$/.test(state))
        return reply.code(400).send({ message: 'UF inválida (use 2 letras, ex: SP)' });
      if (!/^\d{5}-?\d{3}$/.test(cep))
        return reply.code(400).send({ message: 'CEP inválido' });
      if (!/^[\d()+\-\s]{8,20}$/.test(phone))
        return reply.code(400).send({ message: 'Telefone inválido' });
      if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) || email.length > 255)
        return reply.code(400).send({ message: 'E-mail inválido' });
      if (!cv) return reply.code(400).send({ message: 'Anexe seu currículo em PDF (até 5MB)' });

      await pool.query(
        `INSERT INTO career_applications
           (full_name, city, state, cep, phone, email, cv_filename, cv_mime, cv_data, cv_size_bytes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [full_name, city, state, cep, phone, email, cv.filename, cv.mime, cv.buffer, cv.buffer.length]
      );
      return reply.send({ success: true });
    } catch (err) {
      return safeError(reply, err, app.log, 500, 'Falha ao enviar candidatura');
    }
  });

  app.post('/send-contact-email', async (req) => {
    const name = String(req.body?.name ?? '').slice(0, 100);
    const email = String(req.body?.email ?? '').slice(0, 255);
    const message = String(req.body?.message ?? '').slice(0, 5000);
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return { success: true };
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'OptiStrat <noreply@optistrat.com.br>',
          to: ['comercial@optistrat.com.br'],
          subject: sanitizeHeader(`Novo contato: ${name}`),
          html: `<h2>Novo Contato</h2><p><strong>Nome:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Mensagem:</strong> ${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
        }),
      });
    } catch (e) { app.log.error({ err: e }, 'send-contact-email'); }
    return { success: true };
  });

  app.post('/send-order-email', async (req) => {
    const name = String(req.body?.name ?? '').slice(0, 100);
    const email = String(req.body?.email ?? '').slice(0, 255);
    const services = req.body?.services;
    const implementation_deadline = String(req.body?.implementation_deadline ?? '').slice(0, 200);
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return { success: true };
    try {
      const servicesList = Array.isArray(services)
        ? services.map((s) => String(s)).join(', ')
        : String(services ?? '');
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'OptiStrat <noreply@optistrat.com.br>',
          to: ['comercial@optistrat.com.br'],
          subject: sanitizeHeader(`Novo Orçamento: ${name}`),
          html: `<h2>Novo Orçamento</h2><p><strong>Nome:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Serviços:</strong> ${escapeHtml(servicesList)}</p><p><strong>Prazo:</strong> ${escapeHtml(implementation_deadline)}</p>`,
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

  // Testimonials (admin CRUD)
  app.get('/admin/testimonials', adminGuard, async () => {
    const { rows } = await pool.query(
      'SELECT * FROM testimonials ORDER BY display_order, created_at DESC'
    );
    return rows;
  });
  app.post('/admin/testimonials', adminGuard, async (req, reply) => {
    const { opinion, person_name, company, display_order, active } = req.body || {};
    if (!opinion || !person_name || !company) {
      return reply.code(400).send({ message: 'Opinião, nome e empresa são obrigatórios' });
    }
    const { rows } = await pool.query(
      `INSERT INTO testimonials (opinion, person_name, company, display_order, active)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [opinion, person_name, company, display_order || 0, active !== false]
    );
    return rows[0];
  });
  app.put('/admin/testimonials/:id', adminGuard, async (req) => {
    const { opinion, person_name, company, display_order, active } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE testimonials
          SET opinion=$1, person_name=$2, company=$3, display_order=$4, active=$5, updated_at=NOW()
        WHERE id=$6 RETURNING *`,
      [opinion, person_name, company, display_order || 0, active !== false, req.params.id]
    );
    return rows[0];
  });
  app.delete('/admin/testimonials/:id', adminGuard, async (req) => {
    await pool.query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
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

  // Career applications (admin CRUD)
  app.get('/admin/career-applications', adminGuard, async () => {
    const { rows } = await pool.query(
      `SELECT id, full_name, city, state, cep, phone, email,
              cv_filename, cv_mime, cv_size_bytes, notes, status, created_at
         FROM career_applications
        ORDER BY created_at DESC`
    );
    return rows;
  });
  app.put('/admin/career-applications/:id', adminGuard, async (req, reply) => {
    const { status, notes } = req.body || {};
    const allowed = ['new', 'reviewing', 'contacted', 'hired', 'rejected'];
    if (status && !allowed.includes(status))
      return reply.code(400).send({ message: 'Status inválido' });
    const { rows } = await pool.query(
      `UPDATE career_applications
          SET status = COALESCE($1, status),
              notes = COALESCE($2, notes)
        WHERE id = $3
        RETURNING id, full_name, city, state, cep, phone, email,
                  cv_filename, cv_mime, cv_size_bytes, notes, status, created_at`,
      [status || null, notes ?? null, req.params.id]
    );
    if (rows.length === 0) return reply.code(404).send({ message: 'Candidatura não encontrada' });
    return rows[0];
  });
  app.delete('/admin/career-applications/:id', adminGuard, async (req) => {
    await pool.query('DELETE FROM career_applications WHERE id = $1', [req.params.id]);
    return { success: true };
  });
  app.get('/admin/career-applications/:id/cv', adminGuard, async (req, reply) => {
    const { rows } = await pool.query(
      'SELECT cv_data, cv_mime, cv_filename FROM career_applications WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return reply.code(404).send({ message: 'Currículo não encontrado' });
    const r = rows[0];
    reply
      .header('Content-Type', r.cv_mime || 'application/pdf')
      .header('Content-Disposition', `inline; filename="${r.cv_filename || 'curriculo.pdf'}"`)
      .header('Cache-Control', 'private, no-store');
    return reply.send(r.cv_data);
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
      // SECURITY: SVG is intentionally excluded — it can contain inline <script>
      // that would execute when served with image/svg+xml inline disposition.
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
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
    const { totalInserted, results } = await runFeedImport(pool);
    return { success: true, message: `${totalInserted} novas notícias importadas`, results };
  });

  // News sources CRUD
  app.get('/admin/news-sources', adminGuard, async () => {
    const { rows } = await pool.query(
      `SELECT id, name, url, active, created_at,
              last_fetched_at, last_status, last_error, last_imported_count,
              fetch_interval_minutes
         FROM news_sources ORDER BY created_at DESC`
    );
    return rows;
  });
  app.post('/admin/news-sources', adminGuard, async (req, reply) => {
    const { name, url, active = true, fetch_interval_minutes = 0 } = req.body || {};
    if (!name || !url) return reply.code(400).send({ message: 'Nome e URL são obrigatórios' });
    try {
      const { rows } = await pool.query(
        'INSERT INTO news_sources (name, url, active, fetch_interval_minutes) VALUES ($1, $2, $3, $4) RETURNING *',
        [name.trim(), url.trim(), !!active, Math.max(0, parseInt(fetch_interval_minutes) || 0)]
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') return reply.code(409).send({ message: 'Esta URL já está cadastrada' });
      throw err;
    }
  });
  app.put('/admin/news-sources/:id', adminGuard, async (req, reply) => {
    const { name, url, active, fetch_interval_minutes = 0 } = req.body || {};
    if (!name || !url) return reply.code(400).send({ message: 'Nome e URL são obrigatórios' });
    const { rows } = await pool.query(
      'UPDATE news_sources SET name=$1, url=$2, active=$3, fetch_interval_minutes=$4 WHERE id=$5 RETURNING *',
      [name.trim(), url.trim(), !!active, Math.max(0, parseInt(fetch_interval_minutes) || 0), req.params.id]
    );
    if (rows.length === 0) return reply.code(404).send({ message: 'Fonte não encontrada' });
    // If source was deactivated, unpublish its news so they disappear from the site.
    if (!rows[0].active) {
      await pool.query('UPDATE news SET published = false WHERE source_id = $1', [req.params.id]);
    }
    return rows[0];
  });
  app.delete('/admin/news-sources/:id', adminGuard, async (req) => {
    // Unpublish related news before delete (FK is SET NULL, so we'd lose the link otherwise).
    await pool.query('UPDATE news SET published = false WHERE source_id = $1', [req.params.id]);
    await pool.query('DELETE FROM news_sources WHERE id = $1', [req.params.id]);
    return { success: true };
  });
}

// =================== Feed import + scheduler ===================

function parseFeed(xml) {
  const items = [];
  const decode = (s) => s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const extractImage = (block, descriptionHtml) => {
    // Try common feed image locations in order of reliability.
    let m = block.match(/<media:content[^>]*url="([^"]+)"/i)
      || block.match(/<media:thumbnail[^>]*url="([^"]+)"/i)
      || block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i)
      || block.match(/<enclosure[^>]*type="image[^"]*"[^>]*url="([^"]+)"/i)
      || block.match(/<itunes:image[^>]*href="([^"]+)"/i);
    if (m) return m[1];
    // Fall back to first <img> in description/content.
    const imgMatch = (descriptionHtml || '').match(/<img[^>]*src="([^"]+)"/i)
      || block.match(/<img[^>]*src="([^"]+)"/i);
    return imgMatch ? imgMatch[1] : null;
  };
  // RSS 2.0 <item>
  const itemRegex = /<item[\s>][\s\S]*?<\/item>/g;
  for (const block of xml.match(itemRegex) || []) {
    const t = block.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const d = block.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    const l = block.match(/<link[^>]*>([\s\S]*?)<\/link>/);
    const g = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
    const title = t ? decode(t[1]).trim() : '';
    const descriptionRaw = d ? decode(d[1]) : '';
    const description = descriptionRaw.replace(/<[^>]*>/g, '').trim().substring(0, 500);
    const link = l ? decode(l[1]).trim() : '';
    const guid = g ? decode(g[1]).trim() : '';
    const image = extractImage(block, descriptionRaw);
    if (title) items.push({ title, description, link, guid, image });
  }
  // Atom <entry>
  const entryRegex = /<entry[\s>][\s\S]*?<\/entry>/g;
  for (const block of xml.match(entryRegex) || []) {
    const t = block.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const s = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || block.match(/<content[^>]*>([\s\S]*?)<\/content>/);
    const l = block.match(/<link[^>]*href="([^"]+)"/);
    const idTag = block.match(/<id[^>]*>([\s\S]*?)<\/id>/);
    const title = t ? decode(t[1]).trim() : '';
    const descriptionRaw = s ? decode(s[1]) : '';
    const description = descriptionRaw.replace(/<[^>]*>/g, '').trim().substring(0, 500);
    const link = l ? l[1].trim() : '';
    const guid = idTag ? decode(idTag[1]).trim() : '';
    const image = extractImage(block, descriptionRaw);
    if (title) items.push({ title, description, link, guid, image });
  }
  return items;
}

export async function runFeedImport(pool, sourceFilter = null) {
  const { rows: sources } = sourceFilter
    ? await pool.query('SELECT id, name, url FROM news_sources WHERE active = true AND id = $1', [sourceFilter])
    : await pool.query('SELECT id, name, url FROM news_sources WHERE active = true');
  const feedList = sources.length > 0
    ? sources
    : [
        { id: null, name: 'TecMundo', url: 'https://feeds.feedburner.com/tecmundo' },
        { id: null, name: 'Olhar Digital', url: 'https://olhardigital.com.br/feed/' },
        { id: null, name: 'Canaltech', url: 'https://canaltech.com.br/rss/' },
      ];
  let totalInserted = 0;
  const results = [];
  for (const feed of feedList) {
    let status = 'success';
    let error = null;
    let imported = 0;
    try {
      const resp = await fetch(feed.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!resp.ok) {
        status = 'error';
        error = `HTTP ${resp.status}`;
      } else {
        const xml = await resp.text();
        const items = parseFeed(xml).slice(0, 10);
        if (items.length === 0) {
          status = 'empty';
          error = 'Nenhum item encontrado no feed';
        }
        for (const item of items) {
          // Dedupe by stable identifier: prefer guid, fall back to link, then title.
          const externalId = (item.guid || item.link || '').trim() || null;
          const { rows: existing } = externalId
            ? await pool.query(
                'SELECT id FROM news WHERE external_id = $1 OR (external_id IS NULL AND title = $2) LIMIT 1',
                [externalId, item.title]
              )
            : await pool.query('SELECT id FROM news WHERE title = $1 LIMIT 1', [item.title]);
          if (existing.length === 0) {
            await pool.query(
              `INSERT INTO news (title, content, excerpt, image_url, source_url, published, source_id, external_id)
               VALUES ($1, $2, $3, $4, $5, true, $6, $7)
               ON CONFLICT (external_id) WHERE external_id IS NOT NULL DO NOTHING`,
              [item.title, item.description, item.description, item.image || null, item.link || null, feed.id, externalId]
            );
            imported++;
          } else if (externalId) {
            // Refresh title/excerpt and backfill external_id on existing row.
            await pool.query(
              `UPDATE news
                 SET title = $1, excerpt = $2, content = $3,
                     image_url = COALESCE($6, image_url),
                     source_url = COALESCE(source_url, $7),
                     external_id = COALESCE(external_id, $4),
                     updated_at = NOW()
               WHERE id = $5`,
              [item.title, item.description, item.description, externalId, existing[0].id, item.image || null, item.link || null]
            );
          }
        }
      }
    } catch (err) {
      status = 'error';
      error = err.message || 'Falha desconhecida';
    }
    totalInserted += imported;
    if (feed.id) {
      await pool.query(
        `UPDATE news_sources
           SET last_fetched_at = NOW(),
               last_status = $1,
               last_error = $2,
               last_imported_count = $3
         WHERE id = $4`,
        [status, error, imported, feed.id]
      );
    }
    results.push({ id: feed.id, name: feed.name, url: feed.url, status, error, imported });
  }
  return { totalInserted, results };
}

/**
 * Background scheduler — checks every minute for active sources whose
 * fetch_interval_minutes elapsed since last_fetched_at, and re-imports them.
 */
export function startNewsScheduler(pool, log) {
  const tick = async () => {
    try {
      const { rows } = await pool.query(`
        SELECT id FROM news_sources
        WHERE active = true
          AND fetch_interval_minutes > 0
          AND (last_fetched_at IS NULL
               OR last_fetched_at < NOW() - (fetch_interval_minutes || ' minutes')::interval)
      `);
      for (const r of rows) {
        try { await runFeedImport(pool, r.id); }
        catch (e) { log?.error({ err: e.message, sourceId: r.id }, 'scheduler import failed'); }
      }
    } catch (err) {
      log?.error({ err: err.message }, 'news scheduler tick failed');
    }
  };
  // Run shortly after boot, then every 60s.
  setTimeout(tick, 30_000);
  setInterval(tick, 60_000);
}