import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-14 h-14",
  sm: "w-16 h-16", 
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
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
