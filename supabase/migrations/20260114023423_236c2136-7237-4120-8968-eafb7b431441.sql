-- Allow users to delete messages in their own threads
CREATE POLICY "Users can delete messages in their threads" 
ON public.chat_messages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM chat_threads 
  WHERE chat_threads.id = chat_messages.thread_id 
  AND chat_threads.user_id = auth.uid()
));