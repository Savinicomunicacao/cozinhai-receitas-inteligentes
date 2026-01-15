-- Add category column to shopping_list_items
ALTER TABLE public.shopping_list_items 
ADD COLUMN category text DEFAULT NULL;