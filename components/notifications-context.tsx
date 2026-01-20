"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface Notification {
  id: string
  vendedorEmail: string
  compradorEmail: string
  compradorNombre: string
  tipo: "carrito" | "compra"
  productoId: string
  productoNombre: string
  cantidad: number
  fecha: string
  leida: boolean
}

interface NotificationsContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "fecha" | "leida">) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: (vendedorEmail: string) => void
  getUnreadCount: (vendedorEmail: string) => number
  getVendedorNotifications: (vendedorEmail: string) => Notification[]
  deleteNotification: (notificationId: string) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Cargar notificaciones del localStorage
  useEffect(() => {
    const stored = localStorage.getItem("marketplace_notifications")
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch (error) {
        console.error("Error al cargar notificaciones:", error)
      }
    }
  }, [])

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (notifications.length > 0 || notifications.length === 0) {
      localStorage.setItem("marketplace_notifications", JSON.stringify(notifications))
    }
  }, [notifications])

  const addNotification = (notification: Omit<Notification, "id" | "fecha" | "leida">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fecha: new Date().toISOString(),
      leida: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === notificationId ? { ...notif, leida: true } : notif))
    )
  }

  const markAllAsRead = (vendedorEmail: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.vendedorEmail === vendedorEmail ? { ...notif, leida: true } : notif
      )
    )
  }

  const getUnreadCount = (vendedorEmail: string) => {
    return notifications.filter((notif) => notif.vendedorEmail === vendedorEmail && !notif.leida).length
  }

  const getVendedorNotifications = (vendedorEmail: string) => {
    return notifications.filter((notif) => notif.vendedorEmail === vendedorEmail)
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        getUnreadCount,
        getVendedorNotifications,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
