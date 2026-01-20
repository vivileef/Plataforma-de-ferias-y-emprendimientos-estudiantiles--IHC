"use client"

import { Button } from "@/components/ui/button"
import { Store, LogOut, Menu, User } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { getSession, setSession } from "@/components/auth/users"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { NotificacionesHeader } from "@/components/shared/notificaciones-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  userName?: string
  userRole?: string
  showLogout?: boolean
}

export function AppHeader({ userName, userRole, showLogout = true }: AppHeaderProps) {
  const [sessionName, setSessionName] = useState<string | undefined>(userName)
  const [sessionRole, setSessionRole] = useState<string | undefined>(userRole)
  const pathname = usePathname()

  useEffect(() => {
    try {
      const s = getSession()
      if (s) setSessionName(s.name || s.email)
      if (s) setSessionRole(s.role)
    } catch (e) {
      // ignore
    }
  }, [])

  const handleLogout = () => {
    try {
      setSession(null)
      // reload to clear state
      window.location.href = "/"
    } catch (e) {
      window.location.href = "/"
    }
  }

  const getCurrentForm = () => {
    if (pathname.includes("/admin")) return "Administración"
    if (pathname.includes("/comprador")) return "Comprador"
    if (pathname.includes("/vendedor")) return "Vendedor"
    return "Inicio"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Store className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Feria Artesanal</span>
        </Link>

        <div className="flex items-center gap-4">
          <Input type="text" placeholder="Buscar..." className="hidden md:block w-64" />
          <span className="text-sm text-muted-foreground hidden lg:block">
            Formulario actual: {getCurrentForm()}
          </span>
          {sessionName && (
            <div className="hidden md:block text-sm mr-2">
              Hola, <span className="font-medium">{sessionName}</span>
            </div>
          )}

          {/* Icono de notificaciones solo para vendedor */}
          {sessionRole === "vendedor" && <NotificacionesHeader />}

          {/* Menú hamburguesa con todas las opciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {sessionName && (
                <>
                  <DropdownMenuLabel>
                    {sessionName}
                    {sessionRole && <span className="block text-xs text-muted-foreground font-normal">{sessionRole}</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {sessionName && sessionRole && (
                <DropdownMenuItem asChild>
                  <Link
                    href={
                      sessionRole === "vendedor"
                        ? "/vendedor/perfil"
                        : sessionRole === "comprador"
                        ? "/comprador/perfil"
                        : "/admin/dashboard"
                    }
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Ver/Editar Perfil
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <div className="flex items-center justify-between cursor-default">
                  <span>Idioma</span>
                  <LanguageToggle />
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <div className="flex items-center justify-between cursor-default">
                  <span>Tema</span>
                  <ThemeToggle />
                </div>
              </DropdownMenuItem>

              {showLogout && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
