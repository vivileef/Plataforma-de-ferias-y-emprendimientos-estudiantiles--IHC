"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { resetPassword } from "@/components/auth/users"
import Link from "next/link"
import { CheckCircle2, AlertCircle, Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ResetPasswordProps {
  token: string
}

export function ResetPassword({ token }: ResetPasswordProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Validar que el token exista y no esté vacío
    if (!token || token.trim() === "") {
      setTokenValid(false)
    }
  }, [token])

  const getPasswordStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= 8) strength += 25
    if (pass.length >= 12) strength += 25
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 20
    if (/\d/.test(pass)) strength += 15
    if (/[^a-zA-Z\d]/.test(pass)) strength += 15
    return strength
  }

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength < 30) return { label: "Muy débil", color: "bg-red-500" }
    if (strength < 50) return { label: "Débil", color: "bg-orange-500" }
    if (strength < 75) return { label: "Aceptable", color: "bg-yellow-500" }
    if (strength < 90) return { label: "Fuerte", color: "bg-green-500" }
    return { label: "Muy fuerte", color: "bg-green-600" }
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthInfo = getPasswordStrengthLabel(passwordStrength)

  const validatePassword = () => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres"
    }
    if (!/[a-z]/.test(password)) {
      return "La contraseña debe incluir al menos una letra minúscula"
    }
    if (!/[A-Z]/.test(password)) {
      return "La contraseña debe incluir al menos una letra mayúscula"
    }
    if (!/\d/.test(password)) {
      return "La contraseña debe incluir al menos un número"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validatePassword()
    if (validationError) {
      setError(validationError)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    // Simular pequeño delay
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const res = resetPassword(token, password)
      if (!res.ok) {
        setError(res.error || "No se pudo restablecer la contraseña")
        if (res.error?.includes("Token")) {
          setTokenValid(false)
        }
        setIsLoading(false)
        return
      }
      setSuccess(true)
      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido restablecida exitosamente",
      })
    } catch (e) {
      setError("Error al cambiar la contraseña. Intenta nuevamente.")
    }
    setIsLoading(false)
  }

  if (!tokenValid) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Enlace Inválido</CardTitle>
          <CardDescription>
            Este enlace de recuperación no es válido o ha expirado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">El enlace no es válido</p>
              <p className="text-sm">
                Los enlaces de recuperación expiran después de 1 hora por seguridad.
                Por favor solicita un nuevo enlace de recuperación.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/forgot-password">
              Solicitar nuevo enlace
            </Link>
          </Button>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mx-auto flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Contraseña Actualizada!</CardTitle>
          <CardDescription>
            Tu contraseña ha sido restablecida exitosamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <p className="font-medium mb-1">Cambio exitoso</p>
              <p className="text-sm">
                Ahora puedes iniciar sesión con tu nueva contraseña.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full h-11">
            <Link href="/">
              Ir a iniciar sesión
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Crear Nueva Contraseña</CardTitle>
        <CardDescription>
          Tu nueva contraseña debe ser diferente a las anteriores
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11 pr-10"
                placeholder="Ingresa tu nueva contraseña"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Fortaleza:</span>
                  <span className={`font-medium ${strengthInfo.color.replace('bg-', 'text-')}`}>
                    {strengthInfo.label}
                  </span>
                </div>
                <Progress value={passwordStrength} className="h-2" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="h-11 pr-10"
                placeholder="Confirma tu nueva contraseña"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
            )}
          </div>

          <div className="bg-muted p-3 rounded-lg space-y-2">
            <p className="text-sm font-medium">Requisitos de la contraseña:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li className={password.length >= 8 ? "text-green-600" : ""}>
                • Mínimo 8 caracteres
              </li>
              <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-600" : ""}>
                • Letras mayúsculas y minúsculas
              </li>
              <li className={/\d/.test(password) ? "text-green-600" : ""}>
                • Al menos un número
              </li>
              <li className={/[^a-zA-Z\d]/.test(password) ? "text-green-600" : ""}>
                • Carácter especial (recomendado)
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Guardando...
              </>
            ) : (
              "Restablecer contraseña"
            )}
          </Button>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground text-center flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
