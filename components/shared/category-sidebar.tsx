"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Package, Sparkles, Apple, Flower2, Shirt, Home, Gem, ChevronDown, ChevronUp, Search, DollarSign, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// keep ids as the canonical category values used across the app (so filtering works)
const CATEGORIES = [
  { id: "all", labelKey: "categories.all", icon: Package },
  { id: "Artesanía", labelKey: "categories.artesania", icon: Sparkles },
  { id: "Alimentos", labelKey: "categories.alimentos", icon: Apple },
  { id: "Cosmética", labelKey: "categories.cosmetica", icon: Flower2 },
  { id: "Textil", labelKey: "categories.textil", icon: Shirt },
  { id: "Decoración", labelKey: "categories.decoracion", icon: Home },
  { id: "Joyería", labelKey: "categories.joyeria", icon: Gem },
]

interface CategorySidebarProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
  onFilterChange?: (filters: FilterOptions) => void
}

export interface FilterOptions {
  searchTerm?: string
  priceRange?: [number, number]
  inStock?: boolean
  hasDiscount?: boolean
}

export function CategorySidebar({ selectedCategory, onSelectCategory, onFilterChange }: CategorySidebarProps) {
  const { t } = useLanguage()
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [inStock, setInStock] = useState(false)
  const [hasDiscount, setHasDiscount] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onFilterChange?.({ searchTerm: value, priceRange, inStock, hasDiscount })
  }

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]]
    setPriceRange(newRange)
    onFilterChange?.({ searchTerm, priceRange: newRange, inStock, hasDiscount })
  }

  const handleInStockChange = (checked: boolean) => {
    setInStock(checked)
    onFilterChange?.({ searchTerm, priceRange, inStock: checked, hasDiscount })
  }

  const handleDiscountChange = (checked: boolean) => {
    setHasDiscount(checked)
    onFilterChange?.({ searchTerm, priceRange, inStock, hasDiscount: checked })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setPriceRange([0, 1000])
    setInStock(false)
    setHasDiscount(false)
    onFilterChange?.({ searchTerm: "", priceRange: [0, 1000], inStock: false, hasDiscount: false })
  }

  const activeFiltersCount = [
    searchTerm,
    priceRange[0] > 0 || priceRange[1] < 1000,
    inStock,
    hasDiscount
  ].filter(Boolean).length

  return (
    <div className="w-full h-full">
      <div className="p-4 pl-12 border-b">
        <h2 className="font-semibold text-foreground text-lg">{t("categoriesTitle")}</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2 space-y-2">
          {/* Categorías desplegables */}
          <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 px-4">
                <span className="font-medium">Categorías</span>
                {categoriesOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 px-2 py-2">
              {CATEGORIES.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => onSelectCategory(category.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {t(category.labelKey)}
                  </Button>
                )
              })}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Filtros avanzados desplegables */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Filtros</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                {filtersOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 px-3 py-3">
              {/* Búsqueda por nombre */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar producto
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Escribir nombre..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-9 hover:bg-transparent"
                      onClick={() => handleSearchChange("")}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {searchTerm && (
                  <p className="text-xs text-muted-foreground">
                    Buscando: "{searchTerm}"
                  </p>
                )}
              </div>

              <Separator />

              {/* Rango de precio */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Rango de precio
                </Label>
                <div className="px-2">
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Filtros de checkbox */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Disponibilidad</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={inStock}
                    onChange={(e) => handleInStockChange(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="inStock" className="text-sm cursor-pointer">
                    Solo en stock
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasDiscount"
                    checked={hasDiscount}
                    onChange={(e) => handleDiscountChange(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="hasDiscount" className="text-sm cursor-pointer">
                    Con descuento
                  </Label>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <>
                  <Separator />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )
}
