-- Add UPDATE policy to saved_recipes table so users can move recipes to folders
CREATE POLICY "Users can update their saved recipes"
  ON public.saved_recipes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);