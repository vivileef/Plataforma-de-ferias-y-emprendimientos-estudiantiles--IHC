"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getSession, getUserByEmail, setSession, updateUserProfile } from "@/components/auth/users"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Lock, Shield, Edit2, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

const ProfileSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres").optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password) {
      if (!data.confirmPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Confirma la contraseña", path: ["confirmPassword"] })
      } else if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las contraseñas no coinciden", path: ["confirmPassword"] })
      }
    }
  })

type ProfileFormValues = z.infer<typeof ProfileSchema>

export function ProfileForm({ role }: { role?: "vendedor" | "comprador" | "admin" }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ProfileFormValues>({ resolver: zodResolver(ProfileSchema) })
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const s = getSession()
    if (!s) return
    const user = getUserByEmail(s.email)
    if (!user) return
    setValue("name", user.name || "")
    setValue("email", user.email)
    setValue("phone", user.phone || "")
    setUserRole(user.role)
  }, [setValue])

  const getInitials = () => {
    const name = watch("name")
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    const email = watch("email")
    return email ? email[0].toUpperCase() : "U"
  }

  const getRoleBadge = () => {
    const roleMap = {
      vendedor: { label: "Vendedor", variant: "default" as const, color: "bg-blue-500" },
      comprador: { label: "Comprador", variant: "secondary" as const, color: "bg-green-500" },
      admin: { label: "Administrador", variant: "destructive" as const, color: "bg-purple-500" },
    }
    return roleMap[userRole as keyof typeof roleMap] || { label: userRole, variant: "default" as const, color: "bg-gray-500" }
  }

  useEffect(() => {
    const s = getSession()
    if (!s) return
    const user = getUserByEmail(s.email)
    if (!user) return
    setValue("name", user.name || "")
    setValue("email", user.email)
    setValue("phone", user.phone || "")
  }, [setValue])

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true)
    try {
      const s = getSession()
      if (!s) {
        toast.toast({ title: "Sesión no encontrada", description: "Inicia sesión para editar el perfil", variant: "destructive" })
        setLoading(false)
        return
      }

      const updates: any = { name: data.name, email: data.email, phone: data.phone }
      if (data.password) updates.password = data.password

      const res = updateUserProfile(s.email, updates)
      if (!res.ok) {
        toast.toast({ title: "Error", description: res.error || "No se pudo actualizar el perfil", variant: "destructive" })
        setLoading(false)
        return
      }

      // update session (email/name)
      setSession({ email: res.user!.email, role: s.role, name: res.user!.name })

      toast.toast({ 
        title: "✓ Perfil actualizado", 
        description: "Tus cambios se han guardado correctamente",
        duration: 3000,
      })
      setIsEditing(false)
      // Reset password fields
      setValue("password", "")
      setValue("confirmPassword", "")
    } catch (e) {
      toast.toast({ title: "Error", description: "Ocurrió un error al guardar", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    const s = getSession()
    if (s) {
      const user = getUserByEmail(s.email)
      if (user) {
        setValue("name", user.name || "")
        setValue("email", user.email)
        setValue("phone", user.phone || "")
        setValue("password", "")
        setValue("confirmPassword", "")
      }
    }
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card with Avatar */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20" />
        <CardHeader className="relative pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-16 sm:mt-0 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <CardTitle className="text-3xl">{watch("name") || "Usuario"}</CardTitle>
                <Badge variant={getRoleBadge().variant} className="w-fit">
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleBadge().label}
                </Badge>
              </div>
              <CardDescription className="mt-2">{watch("email")}</CardDescription>
            </div>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)} 
                className="sm:mb-4"
                size="lg"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              {isEditing 
                ? "Actualiza tu información personal y configura tu cuenta" 
                : "Visualiza tu información de perfil"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <User className="h-4 w-4" />
                DATOS PERSONALES
              </div>
              <Separator />
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={!isEditing}
                    className={cn(
                      !isEditing && "bg-muted cursor-default",
                      errors.name && "border-destructive"
                    )}
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    disabled={!isEditing}
                    className={cn(!isEditing && "bg-muted cursor-default")}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Mail className="h-4 w-4" />
                INFORMACIÓN DE CUENTA
              </div>
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  El correo electrónico no se puede modificar
                </p>
              </div>
            </div>

            {/* Security Section - Only shown when editing */}
            {isEditing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  SEGURIDAD
                </div>
                <Separator />
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Nueva contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      className={cn(errors.password && "border-destructive")}
                      placeholder="Dejar en blanco para mantener"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Confirmar contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                      className={cn(errors.confirmPassword && "border-destructive")}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  💡 <strong>Tip:</strong> Usa una contraseña fuerte con al menos 4 caracteres. Déjalo en blanco si no deseas cambiarla.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando cambios..." : "Guardar Cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  size="lg"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default ProfileForm
