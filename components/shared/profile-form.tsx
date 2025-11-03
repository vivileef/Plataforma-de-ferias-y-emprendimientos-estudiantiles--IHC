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
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({ resolver: zodResolver(ProfileSchema) })

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
        toast.toast({ title: "Sesión no encontrada", description: "Inicia sesión para editar el perfil" })
        setLoading(false)
        return
      }

      const updates: any = { name: data.name, email: data.email, phone: data.phone }
      if (data.password) updates.password = data.password

      const res = updateUserProfile(s.email, updates)
      if (!res.ok) {
        toast.toast({ title: "Error", description: res.error || "No se pudo actualizar el perfil" })
        setLoading(false)
        return
      }

      // update session (email/name)
      setSession({ email: res.user!.email, role: s.role, name: res.user!.name })

      toast.toast({ title: "Perfil actualizado", description: "Tus cambios se han guardado correctamente" })
    } catch (e) {
      toast.toast({ title: "Error", description: "Ocurrió un error al guardar" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg w-full space-y-4">
      <div>
        <Label>Nombre</Label>
        <Input {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <Label>Email</Label>
        <Input {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <Label>Teléfono (opcional)</Label>
        <Input {...register("phone")} aria-invalid={!!errors.phone} />
      </div>

      <div>
        <Label>Nueva contraseña (opcional)</Label>
        <Input type="password" {...register("password")} aria-invalid={!!errors.password} />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <div>
        <Label>Confirmar contraseña</Label>
        <Input type="password" {...register("confirmPassword")} aria-invalid={!!errors.confirmPassword} />
        {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </form>
  )
}

export default ProfileForm
