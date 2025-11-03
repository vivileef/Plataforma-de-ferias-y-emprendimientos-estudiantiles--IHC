"use client"

import React from "react"
import Link from "next/link"
import ProfileForm from "@/components/shared/profile-form"

export default function VendedorPerfilPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Editar mi perfil (Vendedor)</h1>
        </div>

        <ProfileForm role="vendedor" />

        <div className="mt-4">
          <Link href="/vendedor/dashboard" className="text-sm underline">Volver al dashboard</Link>
        </div>
      </div>
    </div>
  )
}
