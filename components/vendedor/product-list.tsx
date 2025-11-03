"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, Pencil } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
  description: string
}

interface ProductListProps {
  products: Product[]
  onDelete: (id: string) => void
  onEdit: (product: Product) => void
  onViewDetails: (product: Product) => void
}

export function ProductList({ products, onDelete, onEdit, onViewDetails }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tienes productos publicados aún.</p>
        <p className="text-sm mt-2">Haz clic en "Añadir Producto" para comenzar.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="relative h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {(() => {
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
                  })()}
                </Badge>
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(product)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(product)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(product.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="font-semibold text-primary">€{product.price.toFixed(2)}</span>
              <span className="text-muted-foreground">
                Stock: <span className="font-medium text-foreground">{product.stock}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
