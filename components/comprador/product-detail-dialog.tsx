"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Store, Mail } from "lucide-react"
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

interface ProductDetailDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (product: Product) => void
}

export function ProductDetailDialog({ product, open, onOpenChange, onAddToCart }: ProductDetailDialogProps) {
  if (!product) return null
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="relative h-64 w-full rounded-lg overflow-hidden bg-muted">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{t(CAT_KEY[product.category] || product.category)}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                <span>{product.seller}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 gap-2"
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

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Descripción</h3>
              <p className="text-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Precio</p>
                <p className="text-3xl font-bold text-primary">€{product.price.toFixed(2)}</p>
              </div>
              <Button
                onClick={() => {
                  onAddToCart(product)
                  onOpenChange(false)
                }}
                className="gap-2"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4" />
                Añadir al Carrito
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
