"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  total: number
}

export function CartSheet({ open, onOpenChange, cart, onRemove, onUpdateQuantity, total }: CartSheetProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const handleCheckout = () => {
    setShowSuccess(true)
    toast({
      title: "¡Compra realizada con éxito!",
      description: `Has comprado ${cart.length} producto${cart.length > 1 ? 's' : ''} por €${total.toFixed(2)}`,
      duration: 5000,
    })
    setTimeout(() => {
      setShowSuccess(false)
      onOpenChange(false)
      // Aquí podrías limpiar el carrito si quisieras
    }, 2000)
  }

  const handleConfirmCheckout = () => {
    setShowConfirmDialog(false)
    handleCheckout()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Carrito de Compras</SheetTitle>
          <SheetDescription>
            {cart.length === 0
              ? "Tu carrito está vacío"
              : `${cart.length} producto${cart.length > 1 ? "s" : ""} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {showSuccess && (
            <Alert className="bg-primary/10 border-primary mb-4">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">¡Pedido realizado con éxito!</AlertDescription>
            </Alert>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay productos en tu carrito</p>
              <p className="text-sm mt-2">Explora nuestros productos artesanales</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground mb-1">{item.name}</h4>
                    <p className="text-sm font-semibold text-primary mb-2">€{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <SheetFooter className="flex-col gap-4 border-t pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">€{total.toFixed(2)}</span>
            </div>
            <Button onClick={() => setShowConfirmDialog(true)} className="w-full" size="lg">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Realizar Pedido
            </Button>
          </SheetFooter>
        )}
      </SheetContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que quieres comprar?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a realizar una compra de {cart.length} producto{cart.length > 1 ? 's' : ''} por un total de €{total.toFixed(2)}.
              Esta acción procesará tu pedido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCheckout}>Sí, comprar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
