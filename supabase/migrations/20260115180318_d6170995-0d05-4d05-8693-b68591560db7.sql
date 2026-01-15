-- Create shopping_list_items table
CREATE TABLE public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  is_purchased BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  purchased_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own shopping items"
  ON public.shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping items"
  ON public.shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items"
  ON public.shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items"
  ON public.shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for shopping list
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_list_items;