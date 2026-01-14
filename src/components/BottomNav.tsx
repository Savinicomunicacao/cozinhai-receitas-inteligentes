import { Link, useLocation } from "react-router-dom";
import { MessageCircle, ChefHat, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app/chat", icon: MessageCircle, label: "Chat" },
  { to: "/app/pantry", icon: ChefHat, label: "Cozinha" },
  { to: "/app/saved", icon: Bookmark, label: "Salvas" },
  { to: "/app/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav z-50">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "nav-item min-w-[64px]",
                isActive && "nav-item-active"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-transform duration-200",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
