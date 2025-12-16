"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Mail, Phone, User, Store } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Product {
  id: string
  name: string
  price: number
  seller: string
  category: string
  image: string
  description: string
  descuento?: number
  precioDescuento?: number
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  onViewDetails: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart, onViewDetails }: ProductGridProps) {
  const { t } = useLanguage()
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [selectedProductForContact, setSelectedProductForContact] = useState<Product | null>(null)
  
  const CAT_KEY: Record<string, string> = {
    "Artesanía": "categories.artesania",
    "Alimentos": "categories.alimentos",
    "Cosmética": "categories.cosmetica",
    "Textil": "categories.textil",
    "Decoración": "categories.decoracion",
    "Joyería": "categories.joyeria",
    all: "categories.all",
  }

  const getSellerEmail = (sellerName: string) => {
    const name = sellerName.toLowerCase().replace(/\s+/g, '.')
    return `${name}@feria-artesanal.com`
  }

  const getSellerPhone = (sellerName: string) => {
    const hash = sellerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const lastDigits = (hash % 10000).toString().padStart(4, '0')
    return `+593 99 ${lastDigits.slice(0, 2)} ${lastDigits.slice(2)}`
  }

  const handleContactClick = (product: Product) => {
    setSelectedProductForContact(product)
    setShowContactDialog(true)
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
    <TooltipProvider>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
          <CardHeader className="p-0">
              <div className="relative h-48 w-full bg-muted">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              {product.descuento && product.descuento > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                  -{product.descuento}%
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => onViewDetails(product)}>
                  <Eye className="h-4 w-4" />
                  Detalles
                </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver información detallada del producto</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleContactClick(product)}
                >
                  <Mail className="h-4 w-4" />
                  {t("contactSeller")}
                </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver datos de contacto del vendedor</p>
                  </TooltipContent>
                </Tooltip>
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
            {product.descuento && product.descuento > 0 ? (
              <div className="flex items-center gap-2">
                <p className="text-lg text-muted-foreground line-through">€{product.price.toFixed(2)}</p>
                <p className="text-2xl font-bold text-green-600">€{product.precioDescuento?.toFixed(2)}</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-primary">€{product.price.toFixed(2)}</p>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
            <Button onClick={() => onViewDetails(product)} variant="outline" className="flex-1 gap-2">
              <Eye className="h-4 w-4" />
              Ver
            </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver detalles completos</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
            <Button onClick={() => onAddToCart(product)} className="flex-1 gap-2">
              <ShoppingCart className="h-4 w-4" />
              Añadir
            </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Agregar al carrito de compras</p>
              </TooltipContent>
            </Tooltip>
          </CardFooter>
        </Card>
      ))}
      
      {/* Diálogo de información de contacto */}
      {selectedProductForContact && (
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
                      <p className="text-sm">{selectedProductForContact.seller}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Correo electrónico</p>
                      <a 
                        href={`mailto:${getSellerEmail(selectedProductForContact.seller)}`}
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {getSellerEmail(selectedProductForContact.seller)}
                      </a>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Teléfono</p>
                      <a 
                        href={`tel:${getSellerPhone(selectedProductForContact.seller).replace(/\s/g, '')}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {getSellerPhone(selectedProductForContact.seller)}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md mt-4">
                  <p className="text-xs text-muted-foreground">
                    💬 Puedes contactar al vendedor para consultas sobre el producto: <strong>{selectedProductForContact.name}</strong>
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cerrar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
    </TooltipProvider>
  )
}
