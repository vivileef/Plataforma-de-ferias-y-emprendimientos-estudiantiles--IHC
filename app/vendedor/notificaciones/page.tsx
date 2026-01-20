"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, ShoppingCart, Package, Trash2, Check, CheckCheck, ArrowLeft } from "lucide-react"
import { useNotifications, type Notification } from "@/components/notifications-context"
import { getSession } from "@/components/auth/users"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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

export default function NotificacionesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { getVendedorNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = useNotifications()
  
  const [vendedorEmail, setVendedorEmail] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const session = getSession()
    if (session?.email) {
      setVendedorEmail(session.email)
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    if (vendedorEmail) {
      const updateNotifications = () => {
        const vendedorNotifs = getVendedorNotifications(vendedorEmail)
        setNotifications(vendedorNotifs)
        setUnreadCount(getUnreadCount(vendedorEmail))
      }
      
      updateNotifications()
      const interval = setInterval(updateNotifications, 5000)
      return () => clearInterval(interval)
    }
  }, [vendedorEmail, getVendedorNotifications, getUnreadCount])

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

  const getNotificationIcon = (tipo: string) => {
    return tipo === "carrito" ? <ShoppingCart className="h-4 w-4" /> : <Package className="h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/vendedor/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Notificaciones</h1>
            <p className="text-muted-foreground">Todas tus notificaciones de actividad de compradores</p>
          </div>
        </div>

        {/* Tarjeta principal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                <div>
                  <CardTitle>Centro de Notificaciones</CardTitle>
                  <CardDescription>
                    {unreadCount > 0
                      ? `${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
                      : "No tienes notificaciones sin leer"}
                  </CardDescription>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <ScrollArea className="h-auto">
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <Card
                      key={notif.id}
                      className={`transition-all cursor-pointer hover:shadow-md ${
                        !notif.leida ? "bg-blue-50 border-blue-200" : "bg-background"
                      }`}
                    >
                      <CardContent className="p-4">
                        <Link href={`/vendedor/notificaciones/${notif.id}`}>
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full shrink-0 ${
                                notif.tipo === "carrito"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {getNotificationIcon(notif.tipo)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div>
                                  <p className="text-sm font-semibold">
                                    {notif.compradorNombre}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {notif.tipo === "carrito"
                                      ? `Añadió ${notif.productoNombre} al carrito`
                                      : `Compró ${notif.productoNombre} (x${notif.cantidad})`}
                                  </p>
                                </div>
                                {!notif.leida && (
                                  <Badge variant="default" className="shrink-0">
                                    Nueva
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(notif.fecha)}
                              </p>
                            </div>
                          </div>
                        </Link>
                        
                        <div className="flex gap-1 mt-3 justify-end">
                          {!notif.leida && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.preventDefault()
                                handleMarkAsRead(notif.id)
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeleteNotification(notif.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de eliminación */}
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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
