import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SponsoredContent {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cta_text: string;
  cta_url: string;
  sponsor_name: string;
}

interface SponsoredCardProps {
  content: SponsoredContent;
  variant?: "inline" | "banner";
  className?: string;
}

export function SponsoredCard({ content, variant = "inline", className }: SponsoredCardProps) {
  const handleClick = async () => {
    // Track click
    try {
      await supabase
        .from('sponsored_content')
        .update({ clicks: (await supabase.from('sponsored_content').select('clicks').eq('id', content.id).single()).data?.clicks ?? 0 + 1 })
        .eq('id', content.id);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
    
    // Open URL
    window.open(content.cta_url, '_blank', 'noopener,noreferrer');
  };

  if (variant === "banner") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "w-full p-4 rounded-xl bg-muted/50 border border-border/50 text-left transition-colors hover:bg-muted/80 group",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {content.image_url && (
            <img
              src={content.image_url}
              alt=""
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Patrocinado</p>
            <p className="font-medium text-sm truncate">{content.title}</p>
            {content.description && (
              <p className="text-xs text-muted-foreground truncate">{content.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-primary shrink-0 group-hover:underline">
            {content.cta_text}
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border border-border/50 overflow-hidden bg-card",
      className
    )}>
      <div className="px-3 py-1.5 bg-muted/50 border-b border-border/50">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Patrocinado
        </p>
      </div>
      
      <button
        onClick={handleClick}
        className="w-full p-3 text-left transition-colors hover:bg-muted/30 group"
      >
        <div className="flex gap-3">
          {content.image_url && (
            <img
              src={content.image_url}
              alt=""
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm mb-1">{content.title}</p>
            {content.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {content.description}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-primary group-hover:underline">
              {content.cta_text}
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </button>
      
      <div className="px-3 py-1.5 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground text-right">
          por {content.sponsor_name}
        </p>
      </div>
    </div>
  );
}
