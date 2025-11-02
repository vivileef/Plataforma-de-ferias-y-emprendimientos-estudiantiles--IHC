"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
  description: string
}

interface ProductDetailDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="relative h-64 w-full rounded-lg overflow-hidden bg-muted">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Descripción</h3>
              <p className="text-foreground leading-relaxed">{product.description || "Sin descripción disponible"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Precio</p>
                <p className="text-2xl font-bold text-primary">€{product.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Stock Disponible
                </p>
                <p className="text-2xl font-bold text-foreground">{product.stock}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
