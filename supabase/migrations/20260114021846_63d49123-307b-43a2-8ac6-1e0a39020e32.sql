-- Create chat threads table
CREATE TABLE public.chat_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.chat_threads ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  recipes_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table for generated/saved recipes
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  prep_time_minutes INTEGER NOT NULL DEFAULT 30,
  servings INTEGER NOT NULL DEFAULT 4,
  difficulty TEXT NOT NULL DEFAULT 'facil' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  tags TEXT[] DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  source_ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved recipes table
CREATE TABLE public.saved_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_threads
CREATE POLICY "Users can view their own threads" ON public.chat_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own threads" ON public.chat_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own threads" ON public.chat_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own threads" ON public.chat_threads FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages in their threads" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_threads WHERE id = chat_messages.thread_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create messages in their threads" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_threads WHERE id = chat_messages.thread_id AND user_id = auth.uid())
);

-- RLS policies for recipes (public read for generated recipes, user-specific for custom)
CREATE POLICY "Anyone can view recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Users can create recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS policies for saved_recipes
CREATE POLICY "Users can view their saved recipes" ON public.saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save recipes" ON public.saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave recipes" ON public.saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updating chat_threads updated_at
CREATE TRIGGER update_chat_threads_updated_at
  BEFORE UPDATE ON public.chat_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();