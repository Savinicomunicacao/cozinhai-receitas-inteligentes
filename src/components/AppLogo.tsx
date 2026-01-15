import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8", 
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

export function AppLogo({ size = "md", className }: AppLogoProps) {
  return (
    <img
      src="/icons/icon-512.png"
      alt="Cozinha.ai"
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  );
}
