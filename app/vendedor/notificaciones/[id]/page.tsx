"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ShoppingCart, Package, Copy, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useNotifications, type Notification } from "@/components/notifications-context"
import { getSession } from "@/components/auth/users"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

export default function NotificacionDetail() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const notificationId = params.id as string
  
  const { getVendedorNotifications, markAsRead } = useNotifications()
  const [notification, setNotification] = useState<Notification | null>(null)
  const [vendedorEmail, setVendedorEmail] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (session?.email) {
      setVendedorEmail(session.email)
    }
  }, [])

  useEffect(() => {
    if (vendedorEmail) {
      const allNotifications = getVendedorNotifications(vendedorEmail)
      const found = allNotifications.find((n) => n.id === notificationId)
      if (found) {
        setNotification(found)
        // Marcar como leída
        if (!found.leida) {
          markAsRead(notificationId)
        }
      }
    }
  }, [vendedorEmail, notificationId, getVendedorNotifications, markAsRead])

  const handleCopyEmail = () => {
    if (notification?.compradorEmail) {
      navigator.clipboard.writeText(notification.compradorEmail)
      setCopied(true)
      toast({
        title: "Copiado",
        description: "Email copiado al portapapeles",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!notification) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Notificación no encontrada</p>
          <Link href="/vendedor/dashboard">
            <Button>Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatFullDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd 'de' MMMM 'de' yyyy HH:mm", { locale: es })
    } catch {
      return ""
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header con botón atrás */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Detalles de Notificación</h1>
        </div>

        {/* Card principal */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  notification.tipo === "carrito"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {notification.tipo === "carrito" ? (
                    <ShoppingCart className="h-6 w-6" />
                  ) : (
                    <Package className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {notification.tipo === "carrito"
                      ? "Producto Añadido al Carrito"
                      : "Producto Comprado"}
                  </CardTitle>
                  <CardDescription>
                    {formatFullDate(notification.fecha)}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={notification.tipo === "carrito" ? "secondary" : "default"}>
                {notification.tipo === "carrito" ? "Carrito" : "Compra"}
              </Badge>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            {/* Información del Comprador */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información del Comprador</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Nombre</p>
                  <p className="font-medium text-lg">{notification.compradorNombre}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-base break-all">
                      {notification.compradorEmail}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyEmail}
                      className="h-8 w-8 shrink-0"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información del Producto */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información del Producto</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Producto</p>
                  <p className="font-medium text-lg">{notification.productoNombre}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">ID del Producto</p>
                  <p className="font-mono text-sm break-all">{notification.productoId}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Cantidad</p>
                  <p className="font-medium text-lg">{notification.cantidad} unidad(es)</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Tipo de Acción</p>
                  <p className="font-medium text-lg capitalize">
                    {notification.tipo === "carrito" ? "Carrito" : "Compra"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Acciones */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Acciones</h3>
              <div className="flex flex-col gap-2 md:flex-row">
                <Button variant="outline" onClick={handleCopyEmail} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar Email del Comprador
                </Button>
                <Link href="/vendedor/notificaciones" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Ver todas las notificaciones
                  </Button>
                </Link>
              </div>
            </div>

            {/* Información adicional */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>💡 Consejo:</strong> Puedes usar esta información para contactar directamente con el comprador y responder a su acción.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
