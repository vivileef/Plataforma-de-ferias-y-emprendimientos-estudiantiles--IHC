"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Ban, CheckCircle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
}

interface UsersTableProps {
  users: User[]
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

export function UsersTable({ users, onDelete, onToggleStatus }: UsersTableProps) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{user.name}</h3>
              <Badge variant={user.status === "Activo" ? "default" : "secondary"}>{user.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">Rol: {user.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(user.id)} className="gap-2">
              {user.status === "Activo" ? (
                <>
                  <Ban className="h-4 w-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Activar
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
