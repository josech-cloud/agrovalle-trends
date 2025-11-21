import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  sectors: string[];
  productTypes: string[];
  municipalities: string[];
  sentiments: string[];
  impactLevels: string[];
  reliabilityLevels: string[];
  dateFrom?: string;
  dateTo?: string;
}

interface FilterDrawerProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const SECTORS = ['caña de azúcar', 'café', 'ganadería', 'frutas', 'hortalizas', 'flores', 'otros'];
const MUNICIPALITIES = ['Palmira', 'Cali', 'Tuluá', 'Buga', 'Cartago', 'Sevilla', 'Candelaria', 'Dagua'];
const SENTIMENTS = ['positivo', 'neutral', 'negativo'];
const IMPACT_LEVELS = ['alto', 'medio', 'bajo'];
const RELIABILITY_LEVELS = ['alto', 'medio', 'bajo'];

export const FilterDrawer = ({ filters, onFiltersChange }: FilterDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleCheckboxChange = (category: keyof FilterState, value: string) => {
    const currentValues = localFilters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setLocalFilters({
      ...localFilters,
      [category]: newValues
    });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const clearedFilters: FilterState = {
      sectors: [],
      productTypes: [],
      municipalities: [],
      sentiments: [],
      impactLevels: [],
      reliabilityLevels: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.values(localFilters).reduce((acc, val) => {
    if (Array.isArray(val)) return acc + val.length;
    return acc;
  }, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtrar noticias</SheetTitle>
          <SheetDescription>
            Selecciona los criterios para filtrar las noticias
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">Sector</Label>
            <div className="space-y-2">
              {SECTORS.map(sector => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sector-${sector}`}
                    checked={localFilters.sectors.includes(sector)}
                    onCheckedChange={() => handleCheckboxChange('sectors', sector)}
                  />
                  <label
                    htmlFor={`sector-${sector}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {sector}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Municipio</Label>
            <div className="space-y-2">
              {MUNICIPALITIES.map(municipality => (
                <div key={municipality} className="flex items-center space-x-2">
                  <Checkbox
                    id={`municipality-${municipality}`}
                    checked={localFilters.municipalities.includes(municipality)}
                    onCheckedChange={() => handleCheckboxChange('municipalities', municipality)}
                  />
                  <label
                    htmlFor={`municipality-${municipality}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {municipality}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Sentimiento</Label>
            <div className="space-y-2">
              {SENTIMENTS.map(sentiment => (
                <div key={sentiment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sentiment-${sentiment}`}
                    checked={localFilters.sentiments.includes(sentiment)}
                    onCheckedChange={() => handleCheckboxChange('sentiments', sentiment)}
                  />
                  <label
                    htmlFor={`sentiment-${sentiment}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {sentiment}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Nivel de Impacto</Label>
            <div className="space-y-2">
              {IMPACT_LEVELS.map(level => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`impact-${level}`}
                    checked={localFilters.impactLevels.includes(level)}
                    onCheckedChange={() => handleCheckboxChange('impactLevels', level)}
                  />
                  <label
                    htmlFor={`impact-${level}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Nivel de Veracidad</Label>
            <div className="space-y-2">
              {RELIABILITY_LEVELS.map(level => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`reliability-${level}`}
                    checked={localFilters.reliabilityLevels.includes(level)}
                    onCheckedChange={() => handleCheckboxChange('reliabilityLevels', level)}
                  />
                  <label
                    htmlFor={`reliability-${level}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 sticky bottom-0 bg-background pt-4 border-t">
          <Button onClick={handleClear} variant="outline" className="flex-1 gap-2">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Aplicar filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
