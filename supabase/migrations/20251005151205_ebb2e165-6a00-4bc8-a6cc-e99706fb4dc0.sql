-- Create profiles table with MFA support
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  mfa_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create site_content table for editable content
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_content
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create carousel_images table
CREATE TABLE public.carousel_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on carousel_images
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for site_content
CREATE POLICY "Anyone can view site content"
  ON public.site_content
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update site content"
  ON public.site_content
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert site content"
  ON public.site_content
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete site content"
  ON public.site_content
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for carousel_images
CREATE POLICY "Anyone can view active carousel images"
  ON public.carousel_images
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can view all carousel images"
  ON public.carousel_images
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert carousel images"
  ON public.carousel_images
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update carousel images"
  ON public.carousel_images
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete carousel images"
  ON public.carousel_images
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carousel_images_updated_at
  BEFORE UPDATE ON public.carousel_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial hero content
INSERT INTO public.site_content (section, content) VALUES
('hero', '{
  "title": "Otimize sua Infraestrutura de TI com Soluções Especializadas",
  "subtitle": "Gestão completa de TI que potencializa desempenho, fortalece segurança e acelera o crescimento do seu negócio.",
  "primaryButtonText": "Nossos Serviços",
  "secondaryButtonText": "Contatos"
}'::jsonb);

-- Insert initial carousel images  
INSERT INTO public.carousel_images (image_url, alt_text, display_order, active) VALUES
('/lovable-uploads/carousel-1.jpg', 'Serviços de TI e Gestão Tecnológica', 1, true),
('/lovable-uploads/carousel-2.jpg', 'Ambientes Corporativos de Sucesso', 2, true),
('/lovable-uploads/carousel-3.jpg', 'Gestão de TI e Telecom', 3, true),
('/lovable-uploads/carousel-4.jpg', 'Soluções Empresariais Inovadoras', 4, true);