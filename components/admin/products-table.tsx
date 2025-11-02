"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Ban, CheckCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface Product {
  id: string
  name: string
  seller: string
  category: string
  status: string
}

interface ProductsTableProps {
  products: Product[]
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

export function ProductsTable({ products, onDelete, onToggleStatus }: ProductsTableProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{product.name}</h3>
              <Badge variant={product.status === "Publicado" ? "default" : "secondary"}>{product.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Vendedor: {product.seller}</p>
            <p className="text-sm text-muted-foreground mt-1">Categoría: {(() => {
              const { t } = useLanguage()
              const CAT_KEY: Record<string, string> = {
                "Artesanía": "categories.artesania",
                "Alimentos": "categories.alimentos",
                "Cosmética": "categories.cosmetica",
                "Textil": "categories.textil",
                "Decoración": "categories.decoracion",
                "Joyería": "categories.joyeria",
                all: "categories.all",
              }
              return t(CAT_KEY[product.category] || product.category)
            })()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(product.id)} className="gap-2">
              {product.status === "Publicado" ? (
                <>
                  <Ban className="h-4 w-4" />
                  Ocultar
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Publicar
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
