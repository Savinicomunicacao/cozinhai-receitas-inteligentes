import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-5 h-5",
  sm: "w-6 h-6", 
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
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
