-- Create page_views table for tracking visitor navigation
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_views
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view page views"
ON public.page_views
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create chatbot_interactions table
CREATE TABLE IF NOT EXISTS public.chatbot_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_created_at ON public.chatbot_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_session_id ON public.chatbot_interactions(session_id);

-- Enable RLS
ALTER TABLE public.chatbot_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chatbot_interactions
CREATE POLICY "Anyone can insert chatbot interactions"
ON public.chatbot_interactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view chatbot interactions"
ON public.chatbot_interactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add audit trigger to chatbot_interactions
CREATE TRIGGER audit_chatbot_interactions
  AFTER INSERT OR UPDATE OR DELETE ON public.chatbot_interactions
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

-- Update news table to allow admin management
CREATE POLICY "Admins can view all news"
ON public.news
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert news"
ON public.news
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update news"
ON public.news
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete news"
ON public.news
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));