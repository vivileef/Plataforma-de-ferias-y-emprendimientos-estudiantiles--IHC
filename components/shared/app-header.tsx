"use client"

import { Button } from "@/components/ui/button"
import { Store, LogOut } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { getSession, setSession } from "@/components/auth/users"
import { useEffect, useState } from "react"

interface AppHeaderProps {
  userName?: string
  userRole?: string
  showLogout?: boolean
}

export function AppHeader({ userName, userRole, showLogout = true }: AppHeaderProps) {
  const [sessionName, setSessionName] = useState<string | undefined>(userName)

  useEffect(() => {
    try {
      const s = getSession()
      if (s) setSessionName(s.name || s.email)
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Store className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Feria Artesanal</span>
        </Link>

        <div className="flex items-center gap-2">
          {sessionName && <div className="hidden sm:block text-sm mr-2">Hola, <span className="font-medium">{sessionName}</span></div>}
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
