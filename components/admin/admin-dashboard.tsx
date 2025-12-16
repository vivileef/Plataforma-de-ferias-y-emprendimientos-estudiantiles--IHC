"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, Calendar, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UsersTable } from "./users-table"
import { ProductsTable } from "./products-table"
import { ProductManagement } from "./product-management"
import { FeriasManagement } from "./ferias-management"
import { SancionesVendedor } from "./sanciones-vendedor"
import { AppHeader } from "@/components/shared/app-header"
import { getAllUsers, deleteUser, AppUser } from "@/components/auth/users"
import { useProducts } from "@/components/products-context"
import { useToast } from "@/hooks/use-toast"

export function AdminDashboard() {
  const { products, deleteProduct } = useProducts()
  const { toast } = useToast()
  const [users, setUsers] = useState<AppUser[]>([])
  const [activeSection, setActiveSection] = useState("users")

  // Load users from localStorage
  useEffect(() => {
    setUsers(getAllUsers())
  }, [])

  // Transform users to match the expected format for UsersTable
  const transformedUsers = users.map((user) => ({
    id: user.email, // use email as ID
    name: user.name || "Sin nombre",
    email: user.email,
    role: user.role === "vendedor" ? "Vendedor" : user.role === "comprador" ? "Comprador" : "Administrador",
    status: "Activo" as const, // all users are active by default
  }))

  // Transform products to match the expected format for ProductsTable
  const transformedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    seller: product.seller,
    category: product.category,
    status: product.stock > 0 ? ("Publicado" as const) : ("Pendiente" as const),
  }))

  const handleDeleteUser = (id: string) => {
    // Prevent admin from deleting themselves
    if (id === "admin@gmail.com") {
      toast({
        title: "Acción no permitida",
        description: "No puedes eliminar tu propia cuenta de administrador",
        variant: "destructive",
      })
      return
    }

    const result = deleteUser(id) // id is email
    if (result.ok) {
      setUsers(getAllUsers())
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = (id: string) => {
    toast({
      title: "Función no disponible",
      description: "La activación/desactivación de usuarios estará disponible próximamente",
    })
  }

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id)
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado correctamente",
    })
  }

  const handleToggleProductStatus = (id: string) => {
    toast({
      title: "Función no disponible",
      description: "La activación/desactivación de productos estará disponible próximamente",
    })
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
                <CardTitle className="text-3xl">{transformedUsers.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Productos</CardDescription>
                <CardTitle className="text-3xl">{transformedProducts.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Usuarios Activos</CardDescription>
                <CardTitle className="text-3xl">{transformedUsers.filter((u) => u.status === "Activo").length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Selector de Sección */}
          <div className="flex items-center gap-4">
            <Label htmlFor="section-select" className="text-base font-medium">
              Sección:
            </Label>
            <Select value={activeSection} onValueChange={setActiveSection}>
              <SelectTrigger id="section-select" className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="users">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Usuarios
                  </div>
                </SelectItem>
                <SelectItem value="products">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Publicaciones
                  </div>
                </SelectItem>
                <SelectItem value="management">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Productos
                  </div>
                </SelectItem>
                <SelectItem value="ferias">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ferias
                  </div>
                </SelectItem>
                <SelectItem value="sanciones">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Sanciones
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {activeSection === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios registrados en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <UsersTable users={transformedUsers} onDelete={handleDeleteUser} onToggleStatus={handleToggleUserStatus} />
                </CardContent>
              </Card>
            )}

            {activeSection === "products" && (
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Publicaciones</CardTitle>
                  <CardDescription>Administra los productos publicados en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductsTable
                    products={transformedProducts}
                    onDelete={handleDeleteProduct}
                    onToggleStatus={handleToggleProductStatus}
                  />
                </CardContent>
              </Card>
            )}

            {activeSection === "management" && (
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Productos</CardTitle>
                  <CardDescription>Administra el ciclo de vida y estados de los productos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductManagement />
                </CardContent>
              </Card>
            )}

            {activeSection === "ferias" && (
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Ferias</CardTitle>
                  <CardDescription>Administra ferias y eventos especiales de la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <FeriasManagement />
                </CardContent>
              </Card>
            )}

            {activeSection === "sanciones" && (
              <Card>
                <CardHeader>
                  <CardTitle>Sanciones y Eliminaciones</CardTitle>
                  <CardDescription>Gestiona sanciones y eliminaciones de vendedores</CardDescription>
                </CardHeader>
                <CardContent>
                  <SancionesVendedor />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
