-- Create table for index popup announcements
CREATE TABLE public.index_popup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.index_popup ENABLE ROW LEVEL SECURITY;

-- Anyone can view active popups
CREATE POLICY "Anyone can view active popups"
ON public.index_popup
FOR SELECT
USING (active = true);

-- Only admins can manage popups
CREATE POLICY "Only admins can insert popups"
ON public.index_popup
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update popups"
ON public.index_popup
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete popups"
ON public.index_popup
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all popups"
ON public.index_popup
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_index_popup_updated_at
BEFORE UPDATE ON public.index_popup
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();