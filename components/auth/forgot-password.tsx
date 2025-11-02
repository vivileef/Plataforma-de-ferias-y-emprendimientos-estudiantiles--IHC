"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { requestPasswordReset } from "@/components/auth/users"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successToken, setSuccessToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessToken(null)

    try {
      const res = requestPasswordReset(email)
      if (!res.ok) {
        setError(res.error || "Error al solicitar recuperación")
        setIsLoading(false)
        return
      }
      setSuccessToken(res.token || null)
    } catch (e) {
      setError("Error al procesar la solicitud")
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>Introduce el correo con el que te registraste. Recibirás un enlace para restablecer tu contraseña.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-destructive">{error}</div>}

          {successToken ? (
            <div className="space-y-2">
              <p className="text-success">Solicitud enviada. En un entorno real recibirías un correo.</p>
              <p className="text-sm text-muted-foreground">Para propósitos de desarrollo, usa el siguiente enlace:</p>
              <Link href={`/reset-password/${successToken}`} className="text-primary hover:underline break-all">
                {`${process.env.NEXT_PUBLIC_BASE_URL || ""}/reset-password/${successToken}`}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!successToken && (
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          )}
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground text-center">
            ← Volver al inicio
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
