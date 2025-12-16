"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, AlertCircle } from "lucide-react"
import { ProductList } from "./product-list"
import { AddProductDialog } from "./add-product-dialog"
import { EditProductDialog } from "./edit-product-dialog"
import { ProductDetailDialog } from "./product-detail-dialog"
import { ReclamosVendedor } from "./reclamos-vendedor"
import { ResenasVendedor } from "./resenas-vendedor"
import { PromocionesVendedor } from "./promociones-vendedor"
import { AppHeader } from "@/components/shared/app-header"
import { getSession } from "@/components/auth/users"
import { useProducts } from "@/components/products-context"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"
import { CategorySidebar } from "@/components/shared/category-sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function VendedorDashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("productos")
  const [reclamosPendientes, setReclamosPendientes] = useState(0)
  const [totalResenas, setTotalResenas] = useState(0)
  const [promocionesActivas, setPromocionesActivas] = useState(0)
  const { toast } = useToast()

  // Cargar número de reclamos pendientes y reseñas
  useEffect(() => {
    const loadStats = () => {
      try {
        const session = getSession()
        if (!session?.email) return

        // Reclamos pendientes
        const allReclamos = JSON.parse(localStorage.getItem("marketplace_reclamos") || "[]")
        const misReclamos = allReclamos.filter((r: any) => 
          r.vendedorEmail === session.email && r.estado === "pendiente"
        )
        setReclamosPendientes(misReclamos.length)

        // Total de reseñas
        const allResenas = JSON.parse(localStorage.getItem("marketplace_resenas") || "[]")
        const misResenas = allResenas.filter((resena: any) => {
          const product = products.find((p: any) => p.id === resena.productoId)
          return product !== undefined
        })

        // Promociones activas
        const allPromociones = JSON.parse(localStorage.getItem("marketplace_promociones") || "[]")
        const misPromocionesActivas = allPromociones.filter((promo: any) => {
          if (promo.vendedorEmail !== session.email) return false
          const fechaFin = new Date(promo.fechaFin)
          const ahora = new Date()
          return fechaFin >= ahora && (!promo.limiteUsos || promo.usosActuales < promo.limiteUsos)
        })
        setPromocionesActivas(misPromocionesActivas.length)
        setTotalResenas(misResenas.length)
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      }
    }

    loadStats()
    // Actualizar cada 30 segundos
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [activeTab, products])

  // Filtrar productos por categoría
  const filteredProducts = products.filter(product => 
    selectedCategory === "all" || product.category === selectedCategory
  )

  const handleAddProduct = (product: any) => {
    addProduct({ ...product, seller: "(Vendedor)" })
    setShowAddProduct(false)
    toast({
      title: "¡Producto publicado!",
      description: `${product.name} ha sido añadido a tu catálogo exitosamente.`,
      duration: 4000,
    })
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setShowEditProduct(true)
  }

  const handleUpdateProduct = (id: string, updatedData: any) => {
    updateProduct(id, updatedData)
    setShowEditProduct(false)
    setEditingProduct(null)
    toast({
      title: "¡Producto actualizado!",
      description: `Los cambios en ${updatedData.name || 'el producto'} se han guardado correctamente.`,
      duration: 4000,
    })
  }

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id)
  }

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  // Keyboard shortcuts: 'n' to add new product, 'Esc' to close dialogs, numbers 1-7 filter by category, 'a' for all
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Avoid triggering while typing in inputs/textareas or contentEditable elements
      const active = document.activeElement as HTMLElement | null
      const tag = active?.tagName
      const isTyping = !!(
        active &&
        (tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable || active.getAttribute?.("role") === "textbox")
      )

      // 'n' to add new product
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping) {
        e.preventDefault()
        setShowAddProduct(true)
      }
      // 'Esc' to close dialogs
      if (e.key === "Escape") {
        if (showProductDetail) {
          setShowProductDetail(false)
        } else if (showEditProduct) {
          setShowEditProduct(false)
          setEditingProduct(null)
        } else if (showAddProduct) {
          setShowAddProduct(false)
        }
      }
      // Number keys 1-7 for category filters
      if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const categories = ["all", "Artesanía", "Alimentos", "Cosmética", "Textil", "Decoración", "Joyería"]
        const num = parseInt(e.key)
        if (num >= 1 && num <= 7) {
          e.preventDefault()
          setSelectedCategory(categories[num - 1])
        }
      }
      // 'a' to show all categories
      if (e.key === "a" && !(e.ctrlKey || e.metaKey || e.altKey) && !isTyping) {
        setSelectedCategory("all")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showAddProduct, showEditProduct, showProductDetail])

  const session = typeof window !== "undefined" ? getSession() : null
  const displayName = session?.name || session?.email || ""

  return (
    <TooltipProvider>
    <div className="min-h-screen flex flex-col">
      <AppHeader userName={displayName} userRole="Vendedor" />

      <div className="flex flex-1">
        {/* Botón móvil para sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed bottom-4 left-4 z-40 h-12 w-12 rounded-full shadow-lg"
            >
              <Menu className="h-6 w-6" />
            </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Abrir menú de categorías</p>
              </TooltipContent>
            </Tooltip>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </SheetContent>
        </Sheet>

        {/* Sidebar desktop */}
        <aside className="hidden md:block w-64 border-r bg-card">
          <div className="sticky top-16">
            <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{useLanguage().t("vendorDashboardTitle")}</h1>
              <p className="text-muted-foreground mt-1">{useLanguage().t("vendorDashboardSubtitle")}</p>
              {displayName && <p className="mt-2 text-sm">Hola <span className="font-medium">{displayName}</span>, ¡suerte en las ventas!</p>}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setShowAddProduct(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {useLanguage().t("addProductButton")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Publicar nuevo producto (Atajo: N)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Tabs de navegación */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 max-w-3xl">
              <TabsTrigger value="productos">
                Mis Productos
              </TabsTrigger>
              <TabsTrigger value="reclamos" className="relative">
                Reclamos
                {reclamosPendientes > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold">
                    {reclamosPendientes}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="resenas" className="relative">
                Reseñas
                {totalResenas > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                    {totalResenas}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="promociones" className="relative">
                Promociones
                {promocionesActivas > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-semibold">
                    {promocionesActivas}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="productos" className="space-y-6 mt-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Productos</CardDescription>
                    <CardTitle className="text-3xl">{filteredProducts.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Stock Total</CardDescription>
                    <CardTitle className="text-3xl">{filteredProducts.reduce((acc, p) => acc + p.stock, 0)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Valor Inventario</CardDescription>
                    <CardTitle className="text-3xl">
                      €{filteredProducts.reduce((acc, p) => acc + p.price * p.stock, 0).toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Mis Productos</CardTitle>
                  <CardDescription>Gestiona tu catálogo de productos artesanales</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductList 
                    products={filteredProducts} 
                    onDelete={handleDeleteProduct} 
                    onEdit={handleEditProduct}
                    onViewDetails={handleViewDetails} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reclamos" className="mt-6">
              <ReclamosVendedor />
            </TabsContent>

            <TabsContent value="resenas" className="mt-6">
              <ResenasVendedor />
            </TabsContent>

            <TabsContent value="promociones" className="mt-6">
              <PromocionesVendedor />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      </div>

      <AddProductDialog open={showAddProduct} onOpenChange={setShowAddProduct} onAdd={handleAddProduct} />

      <EditProductDialog 
        open={showEditProduct} 
        onOpenChange={setShowEditProduct} 
        onEdit={handleUpdateProduct}
        product={editingProduct}
      />

      <ProductDetailDialog product={selectedProduct} open={showProductDetail} onOpenChange={setShowProductDetail} />
    </div>
    </TooltipProvider>
  )
}
