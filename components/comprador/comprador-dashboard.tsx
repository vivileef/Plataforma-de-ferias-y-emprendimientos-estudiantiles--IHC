"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Menu, Search } from "lucide-react"
import { ProductGrid } from "./product-grid"
import { CartSheet } from "./cart-sheet"
import { ProductDetailDialog } from "./product-detail-dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/shared/app-header"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getSession } from "@/components/auth/users"
import { CategorySidebar } from "@/components/shared/category-sidebar"
import { useProducts } from "@/components/products-context"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"

// Products come from shared ProductsProvider (persisted in localStorage)

export function CompradorDashboard() {
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const { products } = useProducts()
  const { t } = useLanguage()
  const searchRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const handleAddToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
      toast({
        title: "¡Añadido al carrito!",
        description: `${product.name} - Cantidad actualizada a ${existingItem.quantity + 1}`,
        duration: 3000,
      })
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
      toast({
        title: "¡Producto añadido al carrito!",
        description: `${product.name} - €${product.price.toFixed(2)}`,
        duration: 3000,
      })
    }
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId)
    } else {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }
  }

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q) || product.description.toLowerCase().includes(q)
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Keyboard shortcuts: '/' or 'Ctrl+F' focuses search, 'c' toggles cart, 'Esc' clears search/closes dialogs, numbers 1-6 filter by category
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't trigger shortcuts while the user is typing in an input/textarea or contentEditable.
      const active = document.activeElement as HTMLElement | null
      const tag = active?.tagName
      const isTyping = !!(
        active &&
        (tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable || active.getAttribute?.("role") === "textbox")
      )

      // '/' or 'Ctrl+F' to focus search
      if ((e.key === "/" && !(e.ctrlKey || e.metaKey || e.altKey) && !isTyping) || 
          ((e.ctrlKey || e.metaKey) && e.key === "f")) {
        e.preventDefault()
        const el = document.getElementById("search-input") as HTMLInputElement | null
        el?.focus()
        el?.select() // Select all text in search input
      }
      // 'c' to toggle cart
      if (e.key === "c" && !(e.ctrlKey || e.metaKey || e.altKey) && !isTyping) {
        setShowCart((s) => !s)
      }
      // 'Esc' to clear search or close modals
      if (e.key === "Escape") {
        if (showProductDetail) {
          setShowProductDetail(false)
        } else if (showCart) {
          setShowCart(false)
        } else if (searchQuery) {
          setSearchQuery("")
          const el = document.getElementById("search-input") as HTMLInputElement | null
          el?.blur()
        }
      }
      // Number keys 1-7 for category filters (when not typing)
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
  }, [showProductDetail, showCart, searchQuery])

  return (
    <TooltipProvider>
    <div className="min-h-screen flex flex-col">
      {(() => {
        const session = typeof window !== "undefined" ? getSession() : null
        const displayName = session?.name || session?.email || ""
        return <AppHeader userName={displayName} userRole="Comprador" />
      })()}

      <div className="flex flex-1">
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

        <aside className="hidden md:block w-64 border-r bg-card">
          <div className="sticky top-16">
            <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t("buyerExploreTitle")}</h1>
                <p className="text-muted-foreground mt-1">{t("buyerExploreSubtitle")}</p>
                {(() => {
                  const session = typeof window !== "undefined" ? getSession() : null
                  const displayName = session?.name || session?.email || ""
                  return displayName ? <p className="mt-2 text-sm">Hola <span className="font-medium">{displayName}</span>, ¡suerte en las compras!</p> : null
                })()}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
              <Button onClick={() => setShowCart(true)} className="gap-2 relative">
                <ShoppingCart className="h-4 w-4" />
                {t("viewCart")}
                {cartItemCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-foreground text-primary text-xs font-semibold">
                    {cartItemCount}
                  </span>
                )}
              </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver carrito de compras (Atajo: C)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-input"
                    ref={searchRef}
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Buscar productos (Atajo: Ctrl+F o /)</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            {/* Products */}
            <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} />
          </div>
        </main>
      </div>

      <CartSheet
        open={showCart}
        onOpenChange={setShowCart}
        cart={cart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        total={cartTotal}
      />

      <ProductDetailDialog
        product={selectedProduct}
        open={showProductDetail}
        onOpenChange={setShowProductDetail}
        onAddToCart={handleAddToCart}
      />
    </div>
    </TooltipProvider>
  )
}
