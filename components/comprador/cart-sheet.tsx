"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/components/notifications-context"
import { getSession, getAllUsers } from "@/components/auth/users"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  vendedorEmail?: string
}

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onClearCart: () => void
  total: number
}

export function CartSheet({ open, onOpenChange, cart, onRemove, onUpdateQuantity, onClearCart, total }: CartSheetProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [codigoCupon, setCodigoCupon] = useState("")
  const [cuponAplicado, setCuponAplicado] = useState<any>(null)
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  const aplicarCupon = () => {
    if (!codigoCupon.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de cupón",
        variant: "destructive",
      })
      return
    }

    const stored = localStorage.getItem("marketplace_promociones")
    const promociones = stored ? JSON.parse(stored) : []
    
    const ahora = new Date()
    ahora.setHours(0, 0, 0, 0)
    
    const cupon = promociones.find((p: any) => {
      if (p.tipo !== "cupon" || p.codigo?.toUpperCase() !== codigoCupon.toUpperCase()) return false
      
      const fechaFin = new Date(p.fechaFin + 'T23:59:59')
      const fechaInicio = new Date(p.fechaInicio + 'T00:00:00')
      
      // Verificar que esté activo y dentro del período
      return fechaInicio <= ahora && fechaFin >= ahora && (!p.limiteUsos || p.usosActuales < p.limiteUsos)
    })

    if (cupon) {
      setCuponAplicado(cupon)
      toast({
        title: "¡Cupón aplicado!",
        description: `Descuento del ${cupon.descuento}% aplicado`,
      })
    } else {
      toast({
        title: "Cupón inválido",
        description: "El cupón no existe, ha expirado o alcanzó su límite de usos",
        variant: "destructive",
      })
    }
  }

  const removerCupon = () => {
    setCuponAplicado(null)
    setCodigoCupon("")
    toast({
      title: "Cupón removido",
      description: "El descuento ha sido eliminado",
    })
  }

  const calcularDescuento = () => {
    if (!cuponAplicado) return 0
    return total * (cuponAplicado.descuento / 100)
  }

  const totalConDescuento = total - calcularDescuento()

  const handleCheckout = () => {
    // Incrementar uso del cupón si se aplicó
    if (cuponAplicado) {
      const stored = localStorage.getItem("marketplace_promociones")
      const promociones = stored ? JSON.parse(stored) : []
      const updated = promociones.map((p: any) => 
        p.id === cuponAplicado.id ? { ...p, usosActuales: p.usosActuales + 1 } : p
      )
      localStorage.setItem("marketplace_promociones", JSON.stringify(updated))
    }

    // Enviar notificaciones de compra a los vendedores
    const session = getSession()
    if (session?.email) {
      const users = getAllUsers()
      const compradorUser = users.find((u: any) => u.email === session.email)
      
      cart.forEach((item) => {
        if (item.vendedorEmail) {
          addNotification({
            vendedorEmail: item.vendedorEmail,
            compradorEmail: session.email,
            compradorNombre: compradorUser?.name || session.email,
            tipo: "compra",
            productoId: item.id,
            productoNombre: item.name,
            cantidad: item.quantity,
          })
        } else {
          console.log('Item sin vendedorEmail en carrito:', item.name)
        }
      })
    }

    setShowSuccess(true)
    toast({
      title: "¡Compra realizada con éxito!",
      description: `Has comprado ${cart.length} producto${cart.length > 1 ? 's' : ''} por €${totalConDescuento.toFixed(2)}`,
      duration: 5000,
    })
    setTimeout(() => {
      setShowSuccess(false)
      onOpenChange(false)
      onClearCart()
      setCuponAplicado(null)
      setCodigoCupon("")
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
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0">
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
            {/* Sección de cupón */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">¿Tienes un cupón?</span>
              </div>
              
              {!cuponAplicado ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Código del cupón"
                    value={codigoCupon}
                    onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && aplicarCupon()}
                  />
                  <Button onClick={aplicarCupon} variant="outline">
                    Aplicar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">-{cuponAplicado.descuento}%</Badge>
                    <span className="text-sm font-medium">{cuponAplicado.codigo}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={removerCupon}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">€{total.toFixed(2)}</span>
              </div>
              
              {cuponAplicado && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">Descuento ({cuponAplicado.descuento}%):</span>
                  <span className="text-green-600">-€{calcularDescuento().toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-lg font-bold border-t pt-2">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">€{totalConDescuento.toFixed(2)}</span>
              </div>
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
              Vas a realizar una compra de {cart.length} producto{cart.length > 1 ? 's' : ''} por un total de €{totalConDescuento.toFixed(2)}
              {cuponAplicado && ` (con ${cuponAplicado.descuento}% de descuento aplicado)`}.
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
