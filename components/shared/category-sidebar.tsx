"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, Sparkles, Apple, Flower2, Shirt, Home, Gem } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

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
}

export function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  const { t } = useLanguage()

  return (
    <div className="w-full h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-foreground">{t("categoriesTitle")}</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <nav className="p-2 space-y-1">
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
        </nav>
      </ScrollArea>
    </div>
  )
}
