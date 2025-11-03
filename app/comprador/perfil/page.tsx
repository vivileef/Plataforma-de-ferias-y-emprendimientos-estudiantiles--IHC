"use client"

import React from "react"
import Link from "next/link"
import ProfileForm from "@/components/shared/profile-form"

export default function CompradorPerfilPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Editar mi perfil (Comprador)</h1>
        </div>

        <ProfileForm role="comprador" />

        <div className="mt-4">
          <Link href="/comprador/dashboard" className="text-sm underline">Volver al dashboard</Link>
        </div>
      </div>
    </div>
  )
}
