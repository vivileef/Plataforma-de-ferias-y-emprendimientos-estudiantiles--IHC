"use client"

import { Button } from "@/components/ui/button"
import { Store, LogOut } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { getSession, setSession } from "@/components/auth/users"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"

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
          <Input type="text" placeholder="Buscar..." className="hidden sm:block w-64" />
          <span className="text-sm text-muted-foreground hidden sm:block">
            Formulario actual: {getCurrentForm()}
          </span>
          {sessionName && (
            <div className="hidden sm:block text-sm mr-2">
              Hola, <span className="font-medium">{sessionName}</span>
            </div>
          )}
          {/* Profile link (goes to role-specific profile page) */}
          {sessionName && sessionRole && (
            <Link
              href={
                sessionRole === "vendedor"
                  ? "/vendedor/perfil"
                  : sessionRole === "comprador"
                  ? "/comprador/perfil"
                  : "/admin/dashboard"
              }
              aria-label={`Ir al perfil de ${sessionName}`}
              className="inline-flex items-center gap-2 rounded-md p-2 hover:bg-muted/40 transition-colors"
            >
              <Avatar className="h-8 w-8 sm:h-7 sm:w-7">
                <AvatarFallback>
                  {sessionName
                    .split(" ")
                    .map((n) => (n && n[0] ? n[0] : ""))
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm">Ver/Editar Perfil</span>
            </Link>
          )}
          <LanguageToggle />
          <ThemeToggle />
          {showLogout && (
            <button onClick={handleLogout} className="inline-flex items-center">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
