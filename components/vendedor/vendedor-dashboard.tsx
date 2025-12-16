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
import { FeriasVendedor } from "./ferias-vendedor"
import { AppHeader } from "@/components/shared/app-header"
import { getSession } from "@/components/auth/users"
import { useProducts } from "@/components/products-context"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"
import { CategorySidebar } from "@/components/shared/category-sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Menu, ChevronLeft, ChevronRight, Filter, Package, Star, Gift, Calendar } from "lucide-react"
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
  const [feriasInscritas, setFeriasInscritas] = useState(0)
  const [showSidebar, setShowSidebar] = useState(true)
  const [sidebarFilters, setSidebarFilters] = useState<any>({
    searchTerm: "",
    priceRange: [0, 1000],
    inStock: false,
    hasDiscount: false
  })
  const { toast } = useToast()

  const handleFilterChange = (filters: any) => {
    setSidebarFilters(filters)
  }

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

        // Ferias inscritas
        const allFeriasVendedores = JSON.parse(localStorage.getItem("marketplace_ferias_vendedores") || "[]")
        const misFeriasInscritas = allFeriasVendedores.filter((fv: any) => 
          fv.vendedorEmail === session.email
        )
        setFeriasInscritas(misFeriasInscritas.length)
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      }
    }

    loadStats()
    // Actualizar cada 30 segundos
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [activeTab, products])

  // Filtrar productos por categoría y filtros del sidebar
  const filteredProducts = products.filter(product => {
    // Filtro de categoría
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    
    // Búsqueda por nombre desde filtro del sidebar
    const sidebarSearchQ = sidebarFilters.searchTerm?.toLowerCase() || ""
    const matchesSearch = 
      !sidebarSearchQ ||
      product.name.toLowerCase().includes(sidebarSearchQ) ||
      product.description?.toLowerCase().includes(sidebarSearchQ)
    
    // Filtro de rango de precio
    const price = product.precioDescuento || product.price
    const matchesPrice = price >= sidebarFilters.priceRange[0] && price <= sidebarFilters.priceRange[1]
    
    // Filtro de stock
    const matchesStock = !sidebarFilters.inStock || (product.stock && product.stock > 0)
    
    // Filtro de descuento
    const matchesDiscount = !sidebarFilters.hasDiscount || (product.descuento && product.descuento > 0)
    
    return matchesCategory && matchesSearch && matchesPrice && matchesStock && matchesDiscount
  })

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
              <Filter className="h-6 w-6" />
            </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Categorías y filtros de búsqueda</p>
              </TooltipContent>
            </Tooltip>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <CategorySidebar 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory}
              onFilterChange={handleFilterChange}
            />
          </SheetContent>
        </Sheet>

        {/* Botón toggle para sidebar (solo desktop) */}
        <div className="hidden md:block">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
            className="fixed left-4 top-24 z-40 shadow-lg"
          >
            {showSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar desktop colapsable */}
        <aside 
          className={`hidden md:block w-64 border-r bg-card transition-all duration-300 ease-in-out ${
            showSidebar ? 'translate-x-0' : '-translate-x-full absolute'
          }`}
        >
          <div className="sticky top-16">
            <CategorySidebar 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory}
              onFilterChange={handleFilterChange}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{useLanguage().t("vendorDashboardTitle")}</h1>
              <p className="text-muted-foreground mt-1">{useLanguage().t("vendorDashboardSubtitle")}</p>
              {displayName && <p className="mt-2 text-sm">Hola <span className="font-medium">{displayName}</span>, ¡suerte en las ventas!</p>}
            </div>
            
            {/* Menú desplegable de secciones */}
            <div className="flex items-center gap-2">
              <Label htmlFor="vendor-section-select" className="text-sm font-medium">Sección:</Label>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger id="vendor-section-select" className="w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productos">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Mis Productos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="reclamos">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Reclamos</span>
                      {reclamosPendientes > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold">
                          {reclamosPendientes}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="resenas">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>Reseñas</span>
                      {totalResenas > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                          {totalResenas}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="promociones">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      <span>Promociones</span>
                      {promocionesActivas > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-semibold">
                          {promocionesActivas}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="ferias">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Ferias</span>
                      {feriasInscritas > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-semibold">
                          {feriasInscritas}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contenido de las secciones */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="productos" className="space-y-6 mt-6">
              {/* Header con botón */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Mis Productos</h2>
                  <p className="text-muted-foreground mt-1">
                    Gestiona tu catálogo de productos artesanales
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setShowAddProduct(true)} size="lg">
                      <Plus className="h-5 w-5 mr-2" />
                      {useLanguage().t("addProductButton")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Publicar nuevo producto (Atajo: N)</p>
                  </TooltipContent>
                </Tooltip>
              </div>

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

            <TabsContent value="ferias" className="mt-6">
              <FeriasVendedor />
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
