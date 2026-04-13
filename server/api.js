import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authMiddleware, JWT_SECRET } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(path.dirname(__dirname), 'uploads');

export function createApiRoutes(pool) {
  const router = Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  // Admin middleware
  const requireAdmin = wrap(async (req, res, next) => {
    const { rows } = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1 AND role = $2',
      [req.user.id, 'admin']
    );
    if (rows.length === 0) return res.status(403).json({ message: 'Acesso negado' });
    next();
  });

  // File upload config (for backwards compatibility - also stores in DB)
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm'];
      cb(null, allowed.includes(file.mimetype));
    }
  });

  // =================== AUTH ===================

  router.post('/auth/login', wrap(async (req, res) => {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Credenciais inválidas' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Credenciais inválidas' });

    const { rows: roles } = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1 AND role = $2', [user.id, 'admin']
    );
    if (roles.length === 0) return res.status(403).json({ message: 'Acesso negado' });

    const { rows: profiles } = await pool.query('SELECT mfa_enabled FROM profiles WHERE user_id = $1', [user.id]);
    if (profiles[0]?.mfa_enabled) {
      const mfaToken = jwt.sign({ id: user.id, email: user.email, mfa_pending: true }, JWT_SECRET, { expiresIn: '5m' });
      return res.json({ requiresMfa: true, mfaToken });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  }));

  router.post('/auth/verify-mfa', wrap(async (req, res) => {
    const { mfaToken, code } = req.body;
    let decoded;
    try { decoded = jwt.verify(mfaToken, JWT_SECRET); }
    catch { return res.status(401).json({ message: 'Token MFA expirado' }); }
    if (!decoded.mfa_pending) return res.status(400).json({ message: 'Token inválido' });

    const { rows } = await pool.query('SELECT mfa_secret FROM profiles WHERE user_id = $1', [decoded.id]);
    if (rows.length === 0 || !rows[0].mfa_secret) return res.status(400).json({ message: 'MFA não configurado' });

    const { authenticator } = await import('otplib');
    const valid = authenticator.check(code, rows[0].mfa_secret);
    if (!valid) return res.status(401).json({ message: 'Código MFA inválido' });

    const token = jwt.sign({ id: decoded.id, email: decoded.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: decoded.id, email: decoded.email } });
  }));

  router.get('/auth/me', authMiddleware, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    const { rows: roles } = await pool.query('SELECT role FROM user_roles WHERE user_id = $1', [req.user.id]);
    res.json({ user: rows[0], isAdmin: roles.some(r => r.role === 'admin') });
  }));

  router.post('/setup', wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(rows[0].count) > 0) return res.status(400).json({ message: 'Setup já realizado. Usuários já existem.' });
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email e senha obrigatórios' });
    const hash = await bcrypt.hash(password, 12);
    const { rows: [user] } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email', [email, hash]
    );
    await pool.query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2)', [user.id, 'admin']);
    await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [user.id]);
    res.json({ message: 'Admin criado com sucesso', user });
  }));

  // =================== PUBLIC ===================

  router.get('/news', wrap(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const { rows } = await pool.query(
      'SELECT id, title, content, excerpt, image_url, created_at FROM news WHERE published = true ORDER BY created_at DESC LIMIT $1', [limit]
    );
    res.json(rows);
  }));

  router.get('/news/:id', wrap(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT id, title, content, excerpt, image_url, created_at FROM news WHERE id = $1 AND published = true', [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Notícia não encontrada' });
    res.json(rows[0]);
  }));

  router.get('/products', wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT id, name, description, category, price FROM products WHERE active = true ORDER BY name');
    res.json(rows);
  }));

  router.get('/carousel', wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT id, image_url, alt_text, display_order FROM carousel_images WHERE active = true ORDER BY display_order');
    res.json(rows);
  }));

  router.get('/popups', wrap(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT id, image_url, text, display_order FROM index_popup WHERE active = true ORDER BY display_order'
    );
    res.json(rows);
  }));

  router.get('/site-content/:section', wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT content FROM site_content WHERE section = $1', [req.params.section]);
    if (rows.length === 0) return res.json({ content: null });
    res.json(rows[0]);
  }));

  router.post('/contacts', wrap(async (req, res) => {
    const { name, email, message } = req.body;
    await pool.query('INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)', [name, email, message]);
    res.json({ success: true });
  }));

  router.post('/orders', wrap(async (req, res) => {
    const { name, email, services, implementation_deadline } = req.body;
    await pool.query(
      'INSERT INTO orders (name, email, services, implementation_deadline) VALUES ($1, $2, $3, $4)',
      [name, email, services, implementation_deadline]
    );
    res.json({ success: true });
  }));

  router.post('/page-views', wrap(async (req, res) => {
    const { page_path } = req.body;
    await pool.query('INSERT INTO page_views (page_path) VALUES ($1)', [page_path]);
    res.json({ success: true });
  }));

  router.post('/send-contact-email', wrap(async (req, res) => {
    const { name, email, message } = req.body;
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return res.json({ success: true });
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
    } catch (e) { console.error('Email error:', e); }
    res.json({ success: true });
  }));

  router.post('/send-order-email', wrap(async (req, res) => {
    const { name, email, services, implementation_deadline } = req.body;
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return res.json({ success: true });
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
    } catch (e) { console.error('Email error:', e); }
    res.json({ success: true });
  }));

  router.post('/chatbot', wrap(async (req, res) => {
    const { message } = req.body;
    await pool.query('INSERT INTO chatbot_interactions (user_message) VALUES ($1)', [message]);

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Chatbot não configurado. Entre em contato pelo email comercial@optistrat.com.br' } }] })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Fetch context from DB
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

    if (!response.ok) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Erro ao processar mensagem. Tente novamente.' } }] })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
    } catch (e) { console.error('Stream error:', e); }
    res.end();
  }));

  // =================== MEDIA (BLOB) ===================

  // Serve media from DB by ID
  router.get('/media/:id', wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT data, mime_type, filename FROM media WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Arquivo não encontrado' });
    const media = rows[0];
    res.setHeader('Content-Type', media.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${media.filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.send(media.data);
  }));

  // =================== ADMIN ===================

  // News CRUD
  router.get('/admin/news', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    res.json(rows);
  }));

  router.post('/admin/news', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { title, content, excerpt, image_url, published } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO news (title, content, excerpt, image_url, published) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, excerpt || null, image_url || null, published || false]
    );
    res.json(rows[0]);
  }));

  router.put('/admin/news/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { title, content, excerpt, image_url, published } = req.body;
    const { rows } = await pool.query(
      'UPDATE news SET title=$1, content=$2, excerpt=$3, image_url=$4, published=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [title, content, excerpt, image_url, published, req.params.id]
    );
    res.json(rows[0]);
  }));

  router.delete('/admin/news/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  }));

  // Products CRUD
  router.get('/admin/products', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY name');
    res.json(rows);
  }));

  router.post('/admin/products', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { name, description, category, price, active } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO products (name, description, category, price, active) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, description || null, category || null, price || null, active !== false]
    );
    res.json(rows[0]);
  }));

  router.put('/admin/products/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { name, description, category, price, active } = req.body;
    const { rows } = await pool.query(
      'UPDATE products SET name=$1, description=$2, category=$3, price=$4, active=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [name, description, category, price, active, req.params.id]
    );
    res.json(rows[0]);
  }));

  router.delete('/admin/products/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  }));

  // Carousel CRUD
  router.get('/admin/carousel', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM carousel_images ORDER BY display_order');
    res.json(rows);
  }));

  router.post('/admin/carousel', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { image_url, alt_text, display_order, active } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO carousel_images (image_url, alt_text, display_order, active) VALUES ($1,$2,$3,$4) RETURNING *',
      [image_url, alt_text || 'Imagem do carrossel', display_order || 0, active !== false]
    );
    res.json(rows[0]);
  }));

  router.put('/admin/carousel/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const updates = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      if (['image_url', 'alt_text', 'display_order', 'active'].includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE carousel_images SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    res.json(rows[0]);
  }));

  router.delete('/admin/carousel/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    await pool.query('DELETE FROM carousel_images WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  }));

  // Popups CRUD
  router.get('/admin/popups', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM index_popup ORDER BY display_order');
    res.json(rows);
  }));

  router.post('/admin/popups', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { image_url, text, display_order, active } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO index_popup (image_url, text, display_order, active) VALUES ($1,$2,$3,$4) RETURNING *',
      [image_url || null, text || null, display_order || 0, active !== false]
    );
    res.json(rows[0]);
  }));

  router.put('/admin/popups/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { image_url, text, display_order, active } = req.body;
    const { rows } = await pool.query(
      'UPDATE index_popup SET image_url=$1, text=$2, display_order=$3, active=$4 WHERE id=$5 RETURNING *',
      [image_url, text, display_order, active, req.params.id]
    );
    res.json(rows[0]);
  }));

  router.delete('/admin/popups/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    await pool.query('DELETE FROM index_popup WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  }));

  // Contacts (read-only for admin)
  router.get('/admin/contacts', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(rows);
  }));

  router.delete('/admin/contacts/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    await pool.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  }));

  // Orders (read-only for admin)
  router.get('/admin/orders', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  }));

  // Dashboard Stats
  router.get('/admin/stats', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString();

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

    res.json({
      carouselImages: parseInt(carousel.rows[0].count),
      contacts: parseInt(contacts.rows[0].count),
      pageViews: parseInt(pageViews.rows[0].count),
      chatbotInteractions: parseInt(chatbot.rows[0].count),
      products: parseInt(products.rows[0].count),
      news: parseInt(news.rows[0].count),
      orders: parseInt(orders.rows[0].count),
      topPages,
    });
  }));

  // Site Content
  router.get('/admin/site-content/:section', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT content FROM site_content WHERE section = $1', [req.params.section]);
    if (rows.length === 0) return res.json({ content: null });
    res.json(rows[0]);
  }));

  router.put('/admin/site-content/:section', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const { content } = req.body;
    const { rows } = await pool.query('SELECT id FROM site_content WHERE section = $1', [req.params.section]);
    if (rows.length === 0) {
      await pool.query('INSERT INTO site_content (section, content) VALUES ($1, $2)', [req.params.section, JSON.stringify(content)]);
    } else {
      await pool.query('UPDATE site_content SET content = $1, updated_at = NOW() WHERE section = $2', [JSON.stringify(content), req.params.section]);
    }
    res.json({ success: true });
  }));

  // File Upload - stores in PostgreSQL as BLOB
  router.post('/admin/upload', authMiddleware, requireAdmin, memoryUpload.single('file'), wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    const folder = req.body.folder || 'general';
    const { rows } = await pool.query(
      'INSERT INTO media (filename, mime_type, data, folder, size_bytes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.file.originalname, req.file.mimetype, req.file.buffer, folder, req.file.size]
    );
    const publicUrl = `/api/media/${rows[0].id}`;
    res.json({ url: publicUrl });
  }));

  // Media list for admin
  router.get('/admin/media', authMiddleware, requireAdmin, wrap(async (req, res) => {
    const folder = req.query.folder;
    let query = 'SELECT id, filename, mime_type, folder, size_bytes, created_at FROM media';
    const params = [];
    if (folder) {
      query += ' WHERE folder = $1';
      params.push(folder);
    }
    query += ' ORDER BY created_at DESC LIMIT 100';
    const { rows } = await pool.query(query, params);
    res.json(rows.map(r => ({ ...r, url: `/api/media/${r.id}` })));
  }));

  router.delete('/admin/media/:id', authMiddleware, requireAdmin, wrap(async (req, res) => {
    await pool.query('DELETE FROM media WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  }));

  // MFA
  router.get('/admin/profile/mfa', authMiddleware, wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT mfa_enabled FROM profiles WHERE user_id = $1', [req.user.id]);
    res.json({ mfaEnabled: rows[0]?.mfa_enabled || false });
  }));

  router.post('/admin/mfa/setup', authMiddleware, wrap(async (req, res) => {
    const { authenticator } = await import('otplib');
    const secret = authenticator.generateSecret();
    await pool.query('UPDATE profiles SET mfa_secret = $1 WHERE user_id = $2', [secret, req.user.id]);
    const otpauthUrl = authenticator.keyuri(req.user.email, 'OptiStrat', secret);
    res.json({ otpauthUrl });
  }));

  router.post('/admin/mfa/enable', authMiddleware, wrap(async (req, res) => {
    const { code } = req.body;
    const { rows } = await pool.query('SELECT mfa_secret FROM profiles WHERE user_id = $1', [req.user.id]);
    if (!rows[0]?.mfa_secret) return res.status(400).json({ message: 'MFA não configurado' });
    const { authenticator } = await import('otplib');
    const valid = authenticator.check(code, rows[0].mfa_secret);
    if (!valid) return res.json({ valid: false });
    await pool.query('UPDATE profiles SET mfa_enabled = true WHERE user_id = $1', [req.user.id]);
    res.json({ valid: true });
  }));

  router.post('/admin/mfa/disable', authMiddleware, wrap(async (req, res) => {
    await pool.query('UPDATE profiles SET mfa_enabled = false, mfa_secret = NULL WHERE user_id = $1', [req.user.id]);
    res.json({ success: true });
  }));

  // Fetch tech news (server-side RSS)
  router.post('/fetch-tech-news', authMiddleware, requireAdmin, wrap(async (req, res) => {
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
        let description = descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '').substring(0, 200) : '';
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

    res.json({ success: true, message: `${inserted} novas notícias importadas` });
  }));

  // Error handler
  router.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({ message: err.message || 'Erro interno do servidor' });
  });

  return router;
}
