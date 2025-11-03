import { LoginForm } from "@/components/auth/login-form"
import { Store } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Feria Estudiantil</h1>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <LoginForm
          userType="admin"
          title="Acceso Administrador"
          description="Panel de control para gestionar la plataforma"
        />
      </main>
    </div>
  )
}
