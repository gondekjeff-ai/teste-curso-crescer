-- contacts: validar tamanho e formato
DROP POLICY IF EXISTS "Allow anonymous inserts on contacts" ON public.contacts;
CREATE POLICY "Public can submit valid contacts"
ON public.contacts
FOR INSERT
TO public
WITH CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (message IS NULL OR length(message) <= 5000)
);

-- orders: validar tamanho e formato
DROP POLICY IF EXISTS "Allow anonymous inserts on orders" ON public.orders;
CREATE POLICY "Public can submit valid orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (services IS NULL OR length(services) <= 5000)
  AND (implementation_deadline IS NULL OR length(implementation_deadline) <= 200)
);

-- page_views: caminho válido e curto
DROP POLICY IF EXISTS "Allow anonymous inserts on page_views" ON public.page_views;
CREATE POLICY "Public can record valid page views"
ON public.page_views
FOR INSERT
TO public
WITH CHECK (
  length(page_path) BETWEEN 1 AND 500
  AND page_path LIKE '/%'
);

-- chatbot_interactions: tamanhos máximos (rate limit já vem do trigger)
DROP POLICY IF EXISTS "Allow anonymous inserts on chatbot_interactions" ON public.chatbot_interactions;
CREATE POLICY "Public can insert valid chatbot interactions"
ON public.chatbot_interactions
FOR INSERT
TO public
WITH CHECK (
  (user_message IS NULL OR length(user_message) <= 2000)
  AND (bot_response IS NULL OR length(bot_response) <= 10000)
);
