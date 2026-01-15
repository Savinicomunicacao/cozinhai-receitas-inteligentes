import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SponsoredContent {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cta_text: string;
  cta_url: string;
  sponsor_name: string;
  placement: string;
}

type Placement = "chat" | "recipe" | "saved" | "profile";

export function useSponsoredContent(placement: Placement) {
  const [content, setContent] = useState<SponsoredContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [placement]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsored_content')
        .select('*')
        .eq('placement', placement)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setContent(data as SponsoredContent);
        
        // Track impression - simple update
        try {
          await supabase
            .from('sponsored_content')
            .update({ impressions: (data.impressions || 0) + 1 })
            .eq('id', data.id);
        } catch (e) {
          console.error('Error tracking impression:', e);
        }
      }
    } catch (error) {
      console.error('Error loading sponsored content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { content, isLoading };
}
