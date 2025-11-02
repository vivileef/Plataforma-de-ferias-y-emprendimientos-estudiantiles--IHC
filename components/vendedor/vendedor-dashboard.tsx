"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { ProductList } from "./product-list"
import { AddProductDialog } from "./add-product-dialog"
import { ProductDetailDialog } from "./product-detail-dialog"
import { AppHeader } from "@/components/shared/app-header"
import { getSession } from "@/components/auth/users"
import { useProducts } from "@/components/products-context"
import { useLanguage } from "@/components/language-provider"

export function VendedorDashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false)
  const { products, addProduct, deleteProduct } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)

  const handleAddProduct = (product: any) => {
    addProduct({ ...product, seller: "(Vendedor)" })
    setShowAddProduct(false)
  }

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id)
  }

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  // Keyboard shortcut: 'n' to add new product
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Avoid triggering while typing in inputs/textareas or contentEditable elements
      const active = document.activeElement as HTMLElement | null
      const tag = active?.tagName
      const isTyping = !!(
        active &&
        (tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable || active.getAttribute?.("role") === "textbox")
      )

      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping) {
        setShowAddProduct(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const session = typeof window !== "undefined" ? getSession() : null
  const displayName = session?.name || session?.email || ""

  return (
    <div className="min-h-screen flex flex-col">
  <AppHeader userName={displayName} userRole="Vendedor" />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{useLanguage().t("vendorDashboardTitle")}</h1>
              <p className="text-muted-foreground mt-1">{useLanguage().t("vendorDashboardSubtitle")}</p>
              {displayName && <p className="mt-2 text-sm">Hola <span className="font-medium">{displayName}</span>, ¡suerte en las ventas!</p>}
            </div>
            <Button onClick={() => setShowAddProduct(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {useLanguage().t("addProductButton")}
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Productos</CardDescription>
                <CardTitle className="text-3xl">{products.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Stock Total</CardDescription>
                <CardTitle className="text-3xl">{products.reduce((acc, p) => acc + p.stock, 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Valor Inventario</CardDescription>
                <CardTitle className="text-3xl">
                  €{products.reduce((acc, p) => acc + p.price * p.stock, 0).toFixed(2)}
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
              <ProductList products={products} onDelete={handleDeleteProduct} onViewDetails={handleViewDetails} />
            </CardContent>
          </Card>
        </div>
      </main>

      <AddProductDialog open={showAddProduct} onOpenChange={setShowAddProduct} onAdd={handleAddProduct} />

      <ProductDetailDialog product={selectedProduct} open={showProductDetail} onOpenChange={setShowProductDetail} />
    </div>
  )
}
