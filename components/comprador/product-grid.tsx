"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Mail } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"

interface Product {
  id: string
  name: string
  price: number
  seller: string
  category: string
  image: string
  description: string
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  onViewDetails: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart, onViewDetails }: ProductGridProps) {
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
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No se encontraron productos.</p>
        <p className="text-sm mt-2">Intenta con otra búsqueda o categoría.</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
          <CardHeader className="p-0">
              <div className="relative h-48 w-full bg-muted">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => onViewDetails(product)}>
                  <Eye className="h-4 w-4" />
                  {t("btnViewDetails") || "Ver Detalles"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    (window.location.href = `mailto:${t("contactEmail")}?subject=${encodeURIComponent(
                      `${t("contactSubjectPrefix")} ${product.name}`,
                    )}`)
                  }
                >
                  <Mail className="h-4 w-4" />
                  {t("contactSeller")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Badge variant="secondary" className="mb-2">
              {t(CAT_KEY[product.category] || product.category)}
            </Badge>
            <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">Por {product.seller}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
            <p className="text-2xl font-bold text-primary">€{product.price.toFixed(2)}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 gap-2">
            <Button onClick={() => onViewDetails(product)} variant="outline" className="flex-1 gap-2">
              <Eye className="h-4 w-4" />
              Ver
            </Button>
            <Button onClick={() => onAddToCart(product)} className="flex-1 gap-2">
              <ShoppingCart className="h-4 w-4" />
              Añadir
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
