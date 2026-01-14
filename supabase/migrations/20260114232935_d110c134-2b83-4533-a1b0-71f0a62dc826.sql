-- Create recipe_folders table for organizing saved recipes
CREATE TABLE public.recipe_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recipe_folders
ALTER TABLE public.recipe_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for recipe_folders
CREATE POLICY "Users can view their own folders" 
ON public.recipe_folders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" 
ON public.recipe_folders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
ON public.recipe_folders FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
ON public.recipe_folders FOR DELETE 
USING (auth.uid() = user_id);

-- Add folder_id to saved_recipes table
ALTER TABLE public.saved_recipes 
ADD COLUMN folder_id UUID REFERENCES public.recipe_folders(id) ON DELETE SET NULL;

-- Add trigger for updating updated_at on recipe_folders
CREATE TRIGGER update_recipe_folders_updated_at
BEFORE UPDATE ON public.recipe_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_manual column to recipes table for manually added recipes (scanned/audio)
ALTER TABLE public.recipes 
ADD COLUMN is_manual BOOLEAN DEFAULT false;
