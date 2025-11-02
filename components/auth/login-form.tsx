"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { ensureAdminExists, validateCredentials, setSession } from "@/components/auth/users"

interface LoginFormProps {
  userType: "vendedor" | "comprador" | "admin"
  title: string
  description: string
}

export function LoginForm({ userType, title, description }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // ensure default admin account exists
    try {
      ensureAdminExists()
    } catch (e) {
      // ignore
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // tiny delay to show loader
    await new Promise((resolve) => setTimeout(resolve, 600))

    const res = validateCredentials(email, password, userType)
    if (!res.ok) {
      setError("Credenciales inválidas. Revisa tu correo y contraseña.")
      setIsLoading(false)
      return
    }

    // persist simple session in localStorage (demo only)
    try {
      setSession({ email, role: userType, name: res.user?.name || email })
    } catch (e) {
      // ignore
    }

    setSuccess(true)
    setIsLoading(false)
    setTimeout(() => {
      router.push(`/${userType}/dashboard`)
    }, 900)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {success && (
            <Alert className="bg-primary/10 border-primary">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                Sesión iniciada correctamente. Redirigiendo...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || success}
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || success}
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading || success}>
            {isLoading ? "Iniciando sesión..." : "Entrar"}
          </Button>

          {userType !== "admin" && (
            <p className="text-sm text-muted-foreground text-center">
              ¿No tienes cuenta?{" "}
              <Link href={`/${userType}/registro`} className="text-primary hover:underline font-medium">
                Regístrate aquí
              </Link>
            </p>
          )}

          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground text-center">
            ← Volver al inicio
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
