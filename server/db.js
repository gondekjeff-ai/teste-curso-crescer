import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

pool.on('connect', () => {
  console.log('PostgreSQL client connected');
});

// Bootstrap optional tables that may not exist in older schema dumps
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      ALTER TABLE news_sources
        ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS last_status TEXT,
        ADD COLUMN IF NOT EXISTS last_error TEXT,
        ADD COLUMN IF NOT EXISTS last_imported_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS fetch_interval_minutes INTEGER NOT NULL DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE news
        ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL;
    `);
    await pool.query(`
      ALTER TABLE news
        ADD COLUMN IF NOT EXISTS external_id TEXT;
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS news_external_id_unique
        ON news (external_id) WHERE external_id IS NOT NULL;
    `);
    await pool.query(`
      ALTER TABLE news
        ADD COLUMN IF NOT EXISTS source_url TEXT;
    `);
    // Backfill: previously the article link was incorrectly stored in image_url.
    // Move any non-image URL into source_url and clear image_url.
    await pool.query(`
      UPDATE news
         SET source_url = COALESCE(source_url, image_url),
             image_url = NULL
       WHERE image_url IS NOT NULL
         AND image_url ~* '^https?://'
         AND image_url !~* '\\.(png|jpe?g|gif|webp|svg|avif)(\\?|$)';
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS career_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        cep TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        cv_filename TEXT NOT NULL,
        cv_mime TEXT NOT NULL,
        cv_data BYTEA NOT NULL,
        cv_size_bytes INTEGER NOT NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_career_applications_created
        ON career_applications (created_at DESC);
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        opinion TEXT NOT NULL,
        person_name TEXT NOT NULL,
        company TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_testimonials_active_order
        ON testimonials (active, display_order);
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        label TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_social_links_active_order
        ON social_links (active, display_order);
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        retention_days INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT news_settings_singleton CHECK (id = 1)
      );
    `);
    await pool.query(`
      INSERT INTO news_settings (id, retention_days)
      VALUES (1, 0)
      ON CONFLICT (id) DO NOTHING;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS url_redirects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mask_path TEXT NOT NULL UNIQUE,
        destination_url TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_url_redirects_mask
        ON url_redirects (mask_path) WHERE active = true;
    `);
  } catch (err) {
    console.error('Failed to ensure news_sources table:', err.message);
  }
})();

export default pool;
