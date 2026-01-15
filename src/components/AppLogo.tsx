import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-8 h-8",
  sm: "w-10 h-10", 
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-28 h-28",
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
