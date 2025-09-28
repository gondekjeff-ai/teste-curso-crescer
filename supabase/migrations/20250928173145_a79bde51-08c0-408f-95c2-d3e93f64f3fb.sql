-- Create products table for services and solutions
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  category TEXT NOT NULL CHECK (category IN ('service', 'solution')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news table
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

-- Create contacts table for form submissions
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read access)
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (active = true);

-- Create policies for news (public read access for published)
CREATE POLICY "Anyone can view published news" 
ON public.news 
FOR SELECT 
USING (published = true);

-- Create policies for contacts (allow inserts only)
CREATE POLICY "Anyone can insert contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for products
INSERT INTO public.products (name, description, category, price) VALUES
('Consultoria em TI', 'Análise completa da infraestrutura de TI e recomendações estratégicas', 'service', 5000.00),
('Gerenciamento de Rede', 'Monitoramento 24/7 e manutenção da rede corporativa', 'service', 3000.00),
('Segurança Cibernética', 'Implementação de soluções de segurança e proteção contra ameaças', 'service', 4500.00),
('Cloud Computing', 'Migração e gerenciamento de soluções em nuvem', 'solution', 6000.00),
('Backup Automático', 'Sistema automatizado de backup e recuperação de dados', 'solution', 2500.00),
('Suporte Técnico', 'Suporte técnico especializado 24 horas por dia', 'service', 1500.00);

-- Insert sample data for news
INSERT INTO public.news (title, content, excerpt, published) VALUES
('OptiStrat Expande Serviços de Cloud Computing', 'A OptiStrat anuncia a expansão de seus serviços de computação em nuvem, oferecendo soluções mais robustas e seguras para empresas de todos os portes...', 'Novos serviços de cloud computing disponíveis', true),
('Tendências de Segurança Cibernética em 2024', 'Descubra as principais tendências de segurança cibernética que as empresas devem estar atentas em 2024. Nossa equipe especializada analisa os riscos...', 'Análise das principais tendências de segurança', true),
('Como Otimizar sua Infraestrutura de TI', 'Dicas práticas para otimizar a infraestrutura de TI da sua empresa e reduzir custos operacionais sem comprometer a performance...', 'Guia prático para otimização de TI', true);