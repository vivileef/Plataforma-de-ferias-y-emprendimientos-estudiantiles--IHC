"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersTable } from "./users-table"
import { ProductsTable } from "./products-table"
import { AppHeader } from "@/components/shared/app-header"

export function AdminDashboard() {
  const [users, setUsers] = useState([
    { id: "1", name: "María García", email: "maria@email.com", role: "Vendedor", status: "Activo" },
    { id: "2", name: "Carlos Rodríguez", email: "carlos@email.com", role: "Comprador", status: "Activo" },
    { id: "3", name: "Juan Martínez", email: "juan@email.com", role: "Vendedor", status: "Activo" },
    { id: "4", name: "Ana López", email: "ana@email.com", role: "Vendedor", status: "Inactivo" },
  ])

  const [products, setProducts] = useState([
    { id: "1", name: "Cesta de Mimbre Artesanal", seller: "María García", category: "Artesanía", status: "Publicado" },
    { id: "2", name: "Miel Orgánica 500g", seller: "Juan Martínez", category: "Alimentos", status: "Publicado" },
    { id: "3", name: "Jabón Natural de Lavanda", seller: "Ana López", category: "Cosmética", status: "Pendiente" },
    { id: "4", name: "Bufanda de Lana Tejida", seller: "María García", category: "Textil", status: "Publicado" },
  ])

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  const handleToggleUserStatus = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === "Activo" ? "Inactivo" : "Activo" } : u)))
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const handleToggleProductStatus = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, status: p.status === "Publicado" ? "Pendiente" : "Publicado" } : p)),
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader userName="Admin" userRole="Administrador" />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground mt-1">Gestiona usuarios y publicaciones de la plataforma</p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Usuarios</CardDescription>
                <CardTitle className="text-3xl">{users.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Productos</CardDescription>
                <CardTitle className="text-3xl">{products.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Usuarios Activos</CardDescription>
                <CardTitle className="text-3xl">{users.filter((u) => u.status === "Activo").length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                Publicaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios registrados en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <UsersTable users={users} onDelete={handleDeleteUser} onToggleStatus={handleToggleUserStatus} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Publicaciones</CardTitle>
                  <CardDescription>Administra los productos publicados en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductsTable
                    products={products}
                    onDelete={handleDeleteProduct}
                    onToggleStatus={handleToggleProductStatus}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
