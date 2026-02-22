
-- user_roles table (must be created first, referenced by other policies)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts on contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read contacts" ON public.contacts FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published news" ON public.news FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  services TEXT,
  implementation_deadline TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read orders" ON public.orders FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- carousel_images table
CREATE TABLE public.carousel_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active carousel images" ON public.carousel_images FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage carousel images" ON public.carousel_images FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- index_popup table
CREATE TABLE public.index_popup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  text TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.index_popup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active popups" ON public.index_popup FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage popups" ON public.index_popup FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- site_content table
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage site content" ON public.site_content FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- page_views table
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts on page_views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read page_views" ON public.page_views FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- chatbot_interactions table
CREATE TABLE public.chatbot_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_message TEXT,
  bot_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.chatbot_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts on chatbot_interactions" ON public.chatbot_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read chatbot_interactions" ON public.chatbot_interactions FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- rate_limits table
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
