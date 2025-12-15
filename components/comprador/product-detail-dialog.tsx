"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Store, Mail, Phone, User } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"

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
  const [showContactDialog, setShowContactDialog] = useState(false)
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

  // Generar email y teléfono basados en el nombre del vendedor
  const getSellerEmail = (sellerName: string) => {
    const name = sellerName.toLowerCase().replace(/\s+/g, '.')
    return `${name}@feria-artesanal.com`
  }

  const getSellerPhone = (sellerName: string) => {
    // Generar un número de teléfono simulado basado en el hash del nombre
    const hash = sellerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const lastDigits = (hash % 10000).toString().padStart(4, '0')
    return `+593 99 ${lastDigits.slice(0, 2)} ${lastDigits.slice(2)}`
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
                  onClick={() => setShowContactDialog(true)}
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

      {/* Diálogo de información de contacto */}
      <AlertDialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Información de Contacto
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Vendedor</p>
                    <p className="text-sm">{product.seller}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Correo electrónico</p>
                    <a 
                      href={`mailto:${getSellerEmail(product.seller)}`}
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {getSellerEmail(product.seller)}
                    </a>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Teléfono</p>
                    <a 
                      href={`tel:${getSellerPhone(product.seller).replace(/\s/g, '')}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {getSellerPhone(product.seller)}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md mt-4">
                <p className="text-xs text-muted-foreground">
                  💬 Puedes contactar al vendedor para consultas sobre el producto: <strong>{product.name}</strong>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
