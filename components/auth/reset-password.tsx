b"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/components/auth/users"
import Link from "next/link"

interface ResetPasswordProps {
  token: string
}

export function ResetPassword({ token }: ResetPasswordProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    try {
      const res = resetPassword(token, password)
      if (!res.ok) {
        setError(res.error || "No se pudo restablecer la contraseña")
        setIsLoading(false)
        return
      }
      setSuccess(true)
    } catch (e) {
      setError("Error al cambiar la contraseña")
    }
    setIsLoading(false)
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Contraseña restablecida</CardTitle>
          <CardDescription>Ahora puedes iniciar sesión con tu nueva contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className="text-primary hover:underline">
            Ir a inicio / iniciar sesión
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Restablecer contraseña</CardTitle>
        <CardDescription>Introduce tu nueva contraseña.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-destructive">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Guardando..." : "Restablecer contraseña"}</Button>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground text-center">← Volver al inicio</Link>
        </CardFooter>
      </form>
    </Card>
  )
}
