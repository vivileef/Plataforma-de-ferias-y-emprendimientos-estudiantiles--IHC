"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useNotifications, type Notification } from "@/components/notifications-context"
import { getSession } from "@/components/auth/users"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Package } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function NotificacionesHeader() {
  const { getVendedorNotifications, getUnreadCount } = useNotifications()
  const [vendedorEmail, setVendedorEmail] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (session?.email && session?.role === "vendedor") {
      setVendedorEmail(session.email)
    }
  }, [])

  useEffect(() => {
    if (vendedorEmail) {
      const updateNotifications = () => {
        const vendedorNotifs = getVendedorNotifications(vendedorEmail)
        setNotifications(vendedorNotifs.slice(0, 5)) // Solo las 5 más recientes
        setUnreadCount(getUnreadCount(vendedorEmail))
      }

      updateNotifications()
      // Actualizar cada 3 segundos
      const interval = setInterval(updateNotifications, 3000)
      return () => clearInterval(interval)
    }
  }, [vendedorEmail, getVendedorNotifications, getUnreadCount])

  const getNotificationIcon = (tipo: string) => {
    return tipo === "carrito" ? (
      <ShoppingCart className="h-4 w-4 text-blue-600" />
    ) : (
      <Package className="h-4 w-4 text-green-600" />
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

      if (diffInMinutes < 1) return "Ahora"
      if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `Hace ${diffInHours}h`
      return format(date, "dd MMM", { locale: es })
    } catch {
      return ""
    }
  }

  if (!vendedorEmail) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white"
              variant="default"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="space-y-0">
          <div className="p-4 border-b bg-linear-to-r from-blue-50 to-purple-50">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} nuevas
                </Badge>
              )}
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="divide-y">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/vendedor/notificaciones/${notif.id}`}
                    onClick={() => setOpen(false)}
                  >
                    <Card className={`m-2 cursor-pointer transition-all hover:shadow-md ${
                      !notif.leida ? "bg-blue-50 border-blue-200" : "bg-background"
                    }`}>
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="p-2 rounded-lg bg-background shrink-0">
                            {getNotificationIcon(notif.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {notif.compradorNombre}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notif.tipo === "carrito"
                                ? `Añadió ${notif.productoNombre} al carrito`
                                : `Compró ${notif.productoNombre} (x${notif.cantidad})`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(notif.fecha)}
                            </p>
                          </div>
                          {!notif.leida && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="p-3 border-t bg-muted/30">
            <Link href="/vendedor/notificaciones">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Ver todas las notificaciones
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
