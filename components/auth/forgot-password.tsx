"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { requestPasswordReset, getAllUsers } from "@/components/auth/users"
import { Mail, CheckCircle2, AlertCircle, Copy, ArrowLeft, Shield, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successToken, setSuccessToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("email")
  
  // Para recuperación alternativa
  const [altEmail, setAltEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [altError, setAltError] = useState("")
  const [altSuccess, setAltSuccess] = useState(false)
  
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico")
      return
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido")
      return
    }

    setIsLoading(true)
    setSuccessToken(null)

    // Simular pequeño delay para dar sensación de proceso
    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      const res = requestPasswordReset(email)
      if (!res.ok) {
        setError(res.error || "Error al solicitar recuperación")
        setIsLoading(false)
        return
      }
      setSuccessToken(res.token || null)
      toast({
        title: "Solicitud enviada",
        description: "Se ha generado un enlace de recuperación",
      })
    } catch (e) {
      setError("Error al procesar la solicitud. Intenta nuevamente.")
    }

    setIsLoading(false)
  }

  const handleAlternativeRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setAltError("")

    if (!altEmail.trim() || !userName.trim()) {
      setAltError("Por favor completa todos los campos")
      return
    }

    if (!validateEmail(altEmail)) {
      setAltError("Por favor ingresa un correo electrónico válido")
      return
    }

    setIsLoading(true)

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      const users = getAllUsers()
      const user = users.find(u => 
        u.email.toLowerCase() === altEmail.toLowerCase() &&
        u.name?.toLowerCase() === userName.toLowerCase()
      )

      if (!user) {
        setAltError("Los datos ingresados no coinciden con ninguna cuenta")
        setIsLoading(false)
        return
      }

      // Generar token de recuperación
      const res = requestPasswordReset(altEmail)
      if (!res.ok) {
        setAltError(res.error || "Error al solicitar recuperación")
        setIsLoading(false)
        return
      }

      setAltSuccess(true)
      setSuccessToken(res.token || null)
      toast({
        title: "¡Verificación exitosa!",
        description: "Acceso de recuperación concedido",
      })
    } catch (e) {
      setAltError("Error al procesar la solicitud. Intenta nuevamente.")
    }

    setIsLoading(false)
  }

  const copyLink = () => {
    if (successToken) {
      const link = `${window.location.origin}/reset-password/${successToken}`
      navigator.clipboard.writeText(link)
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      })
    }
  }

  if (successToken || altSuccess) {
    const displayEmail = email || altEmail
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">
            {altSuccess ? "¡Verificación Exitosa!" : "Correo Enviado"}
          </CardTitle>
          <CardDescription>
            {altSuccess ? (
              <>Identidad verificada. Puedes restablecer tu contraseña ahora.</>
            ) : (
              <>Se ha enviado un enlace de recuperación a <strong>{displayEmail}</strong></>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <p className="font-medium mb-2">Revisa tu bandeja de entrada</p>
              <p className="text-sm">
                Te hemos enviado un correo con instrucciones para restablecer tu contraseña.
                Si no lo recibes en unos minutos, revisa tu carpeta de spam.
              </p>
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-muted rounded-lg space-y-3">
            <p className="text-sm font-medium">Modo desarrollo - Enlace de recuperación:</p>
            <div className="flex items-center gap-2">
              <Link 
                href={`/reset-password/${successToken}`} 
                className="text-sm text-primary hover:underline break-all flex-1"
              >
                {`/reset-password/${successToken.substring(0, 20)}...`}
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={copyLink}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              asChild
              variant="default"
              className="w-full"
            >
              <Link href={`/reset-password/${successToken}`}>
                Ir a restablecer contraseña
              </Link>
            </Button>
          </div>

          <div className="text-center space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              ¿No recibiste el correo?
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSuccessToken(null)
                setAltSuccess(false)
                setEmail("")
                setAltEmail("")
                setUserName("")
              }}
              className="w-full"
            >
              Enviar otro enlace
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mx-auto flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
        <CardDescription>
          Elige un método de recuperación para restablecer tu contraseña
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Por Email
            </TabsTrigger>
            <TabsTrigger value="alternative" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verificación
            </TabsTrigger>
          </TabsList>

          {/* Recuperación por Email */}
          <TabsContent value="email" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Recibirás un enlace de recuperación en tu correo
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Recuperación Alternativa */}
          <TabsContent value="alternative" className="space-y-4 mt-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                <p className="font-medium mb-1">Método alternativo de recuperación</p>
                <p className="text-xs">
                  Si no tienes acceso a tu correo, verifica tu identidad con tu nombre de usuario
                </p>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleAlternativeRecovery} className="space-y-4">
              {altError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{altError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="altEmail">Correo electrónico</Label>
                <Input
                  id="altEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={altEmail}
                  onChange={(e) => setAltEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Nombre de usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingresa el nombre exacto con el que te registraste
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Verificando...
                  </>
                ) : (
                  "Verificar identidad"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <Link 
          href="/" 
          className="text-sm text-muted-foreground hover:text-foreground text-center flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </CardFooter>
    </Card>
  )
}
