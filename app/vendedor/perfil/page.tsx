"use client"

import React from "react"
import Link from "next/link"
import { AppHeader } from "@/components/shared/app-header"
import ProfileForm from "@/components/shared/profile-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function VendedorPerfilPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <AppHeader />
      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/vendedor/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Volver al dashboard
              </Button>
            </Link>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-lg text-muted-foreground">
              Administra tu información personal y configuración de cuenta
            </p>
          </div>

          <ProfileForm role="vendedor" />
        </div>
      </main>
    </div>
  )
}
