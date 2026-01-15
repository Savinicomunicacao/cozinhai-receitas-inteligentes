-- Create sponsored content table for ads
CREATE TABLE public.sponsored_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT NOT NULL,
  cta_url TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  placement TEXT NOT NULL CHECK (placement IN ('chat', 'recipe', 'saved', 'profile')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsored_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view active sponsored content
CREATE POLICY "Anyone can view active sponsored content"
  ON public.sponsored_content
  FOR SELECT
  USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

-- Admins can manage sponsored content
CREATE POLICY "Admins can insert sponsored content"
  ON public.sponsored_content
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sponsored content"
  ON public.sponsored_content
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sponsored content"
  ON public.sponsored_content
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));