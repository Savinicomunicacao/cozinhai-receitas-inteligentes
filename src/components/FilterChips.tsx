import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  filters: string[];
  activeFilters: string[];
  onToggle: (filter: string) => void;
}

const filterOptions = [
  { id: "rapida", label: "⚡ Rápida" },
  { id: "barata", label: "💰 Barata" },
  { id: "fit", label: "🥗 Fit" },
  { id: "airfryer", label: "🍟 Airfryer" },
  { id: "vegetariana", label: "🥬 Vegetariana" },
  { id: "sem-lactose", label: "🥛 Sem lactose" },
  { id: "sem-gluten", label: "🌾 Sem glúten" },
];

export function FilterChips({ activeFilters, onToggle }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filterOptions.map((filter) => {
        const isActive = activeFilters.includes(filter.id);
        
        return (
          <Button
            key={filter.id}
            variant={isActive ? "chip-active" : "chip"}
            size="chip"
            onClick={() => onToggle(filter.id)}
            className={cn(
              "shrink-0 transition-all duration-200",
              isActive && "shadow-soft"
            )}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
