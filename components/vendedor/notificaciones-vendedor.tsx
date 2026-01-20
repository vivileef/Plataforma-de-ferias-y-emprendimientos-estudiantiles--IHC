"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, ShoppingCart, Package, Trash2, Check, CheckCheck } from "lucide-react"
import { useNotifications, type Notification } from "@/components/notifications-context"
import { getSession } from "@/components/auth/users"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export function NotificacionesVendedor() {
  const { getVendedorNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount, addNotification } = useNotifications()
  const [vendedorEmail, setVendedorEmail] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const session = getSession()
    if (session?.email) {
      setVendedorEmail(session.email)
      console.log('📧 Email del vendedor:', session.email)
    }
  }, [])

  useEffect(() => {
    if (vendedorEmail) {
      const updateNotifications = () => {
        const vendedorNotifs = getVendedorNotifications(vendedorEmail)
        setNotifications(vendedorNotifs)
        console.log(`📬 Notificaciones cargadas para ${vendedorEmail}:`, vendedorNotifs.length)
      }
      
      updateNotifications()
      // Actualizar cada 5 segundos para reflejar nuevas notificaciones
      const interval = setInterval(updateNotifications, 5000)
      return () => clearInterval(interval)
    }
  }, [vendedorEmail, getVendedorNotifications])

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead(vendedorEmail)
    toast({
      title: "Notificaciones marcadas",
      description: "Todas las notificaciones se han marcado como leídas",
    })
  }

  const handleDeleteNotification = (notificationId: string) => {
    setNotificationToDelete(notificationId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete)
      toast({
        title: "Notificación eliminada",
        description: "La notificación ha sido eliminada correctamente",
      })
    }
    setDeleteDialogOpen(false)
    setNotificationToDelete(null)
  }

  // Función de prueba para crear una notificación de prueba (solo para desarrollo)
  const handleTestNotification = () => {
    if (!vendedorEmail) return
    
    addNotification({
      vendedorEmail: vendedorEmail,
      compradorEmail: "test@example.com",
      compradorNombre: "Usuario de Prueba",
      tipo: Math.random() > 0.5 ? "carrito" : "compra",
      productoId: "test-" + Date.now(),
      productoNombre: "Producto de Prueba",
      cantidad: Math.floor(Math.random() * 5) + 1,
    })
    
    toast({
      title: "✅ Notificación de prueba creada",
      description: "Se ha generado una notificación de prueba",
    })
  }

  const getNotificationIcon = (tipo: string) => {
    return tipo === "carrito" ? <ShoppingCart className="h-4 w-4" /> : <Package className="h-4 w-4" />
  }

  const getNotificationText = (notif: Notification) => {
    if (notif.tipo === "carrito") {
      return (
        <>
          <strong>{notif.compradorNombre}</strong> añadió <strong>{notif.productoNombre}</strong> al carrito
          {notif.cantidad > 1 && ` (x${notif.cantidad})`}
        </>
      )
    } else {
      return (
        <>
          <strong>{notif.compradorNombre}</strong> compró <strong>{notif.productoNombre}</strong>
          {notif.cantidad > 1 && ` (x${notif.cantidad})`}
        </>
      )
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        if (diffInMinutes < 1) return "Hace un momento"
        return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`
      } else if (diffInHours < 24) {
        return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`
      } else {
        return format(date, "dd MMM yyyy, HH:mm", { locale: es })
      }
    } catch (error) {
      return ""
    }
  }

  const unreadCount = getUnreadCount(vendedorEmail)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <div>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? `${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
                    : "No tienes notificaciones sin leer"}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestNotification}
                className="text-xs"
              >
                🧪 Prueba
              </Button>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Card
                    key={notif.id}
                    className={`transition-all ${
                      !notif.leida ? "bg-primary/5 border-primary/20" : "bg-background"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            notif.tipo === "carrito" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                          }`}
                        >
                          {getNotificationIcon(notif.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm leading-relaxed">{getNotificationText(notif)}</p>
                            {!notif.leida && (
                              <Badge variant="default" className="ml-2 shrink-0">
                                Nueva
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{formatDate(notif.fecha)}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!notif.leida && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkAsRead(notif.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteNotification(notif.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar notificación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La notificación se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
