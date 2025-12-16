"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/components/products-context"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar,
  Tag,
  Package,
  Store,
  TrendingUp,
  Search,
  ShoppingCart,
  Eye,
  Filter,
  Sparkles
} from "lucide-react"
import Image from "next/image"
import { ProductDetailDialog } from "./product-detail-dialog"

interface Feria {
  id: string
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  categorias: string[]
  reglas: string
  lineamientos: string
  estado: "activa" | "inactiva" | "cerrada" | "programada"
  adminEmail: string
  fechaCreacion: string
  imagen?: string
  descuentoMinimo?: number
  descuentoMaximo?: number
}

interface FeriaVendedor {
  feriaId: string
  vendedorEmail: string
  fechaInscripcion: string
  estado: "pendiente" | "aprobado" | "rechazado"
  productosIds: string[]
}

type Product = {
  id: string
  nombre: string
  precio: number
  categoria: string
  imagen?: string
  descripcion: string
  stock: number
  vendedor: string
  descuento?: number
  precioDescuento?: number
}

export function FeriasComprador() {
  const { products } = useProducts()
  const { toast } = useToast()
  const [ferias, setFerias] = useState<Feria[]>([])
  const [selectedFeria, setSelectedFeria] = useState<Feria | null>(null)
  const [showFeriaDialog, setShowFeriaDialog] = useState(false)
  const [feriaProducts, setFeriaProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("todas")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)

  useEffect(() => {
    loadFerias()
  }, [])

  const loadFerias = () => {
    const feriasData = localStorage.getItem("marketplace_ferias")
    if (feriasData) {
      const feriasArray: Feria[] = JSON.parse(feriasData)
      
      // Solo mostrar ferias activas
      const feriasActivas = feriasArray.filter(f => f.estado === "activa")
      
      setFerias(feriasActivas)
    }
  }

  const loadFeriaProducts = (feria: Feria) => {
    const vendedoresData = localStorage.getItem("marketplace_ferias_vendedores")
    if (!vendedoresData) {
      setFeriaProducts([])
      return
    }

    const vendedores: FeriaVendedor[] = JSON.parse(vendedoresData)
    
    // Obtener vendedores aprobados de esta feria
    const vendedoresAprobados = vendedores.filter(
      v => v.feriaId === feria.id && v.estado === "aprobado"
    )

    // Recopilar todos los IDs de productos
    const productosIds = vendedoresAprobados.flatMap(v => v.productosIds)

    // Filtrar productos que están en la feria y están activos
    const productosEnFeria = products.filter(p => {
      if (!productosIds.includes(p.id)) return false
      
      // Verificar estado del producto
      const statusData = localStorage.getItem("marketplace_products_status")
      if (statusData) {
        const statusMap: Record<string, any[]> = JSON.parse(statusData)
        const productStatus = statusMap[p.id]
        if (productStatus && productStatus.length > 0) {
          const ultimoEstado = productStatus[productStatus.length - 1].estado
          if (ultimoEstado !== "activo") return false
        }
      }
      
      return true
    })

    setFeriaProducts(productosEnFeria)
  }

  const openFeriaDialog = (feria: Feria) => {
    setSelectedFeria(feria)
    loadFeriaProducts(feria)
    setShowFeriaDialog(true)
    setSearchQuery("")
    setSelectedCategory("todas")
  }

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDialog(true)
  }

  const handleAddToCart = (product: Product) => {
    const sessionData = localStorage.getItem("marketplace_session")
    if (!sessionData) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para añadir productos al carrito",
        variant: "destructive"
      })
      return
    }

    const session = JSON.parse(sessionData)
    const cartKey = `marketplace_cart_${session.email}`
    const cartData = localStorage.getItem(cartKey)
    const cart = cartData ? JSON.parse(cartData) : []

    // Verificar si el producto ya está en el carrito
    const existingIndex = cart.findIndex((item: any) => item.id === product.id)
    
    if (existingIndex >= 0) {
      cart[existingIndex].cantidad += 1
    } else {
      cart.push({
        ...product,
        cantidad: 1
      })
    }

    localStorage.setItem(cartKey, JSON.stringify(cart))
    
    toast({
      title: "¡Añadido al carrito!",
      description: `${product.nombre} ha sido añadido a tu carrito`
    })
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Filtrar productos de la feria actual
  const filteredFeriaProducts = feriaProducts.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "todas" || product.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Obtener categorías únicas de los productos de la feria
  const categoriasDisponibles = selectedFeria 
    ? Array.from(new Set(feriaProducts.map(p => p.categoria)))
    : []

  // Calcular estadísticas de la feria
  const getVendedoresCount = (feriaId: string) => {
    const vendedoresData = localStorage.getItem("marketplace_ferias_vendedores")
    if (!vendedoresData) return 0
    
    const vendedores: FeriaVendedor[] = JSON.parse(vendedoresData)
    return vendedores.filter(v => v.feriaId === feriaId && v.estado === "aprobado").length
  }

  const getProductosCount = (feriaId: string) => {
    const vendedoresData = localStorage.getItem("marketplace_ferias_vendedores")
    if (!vendedoresData) return 0
    
    const vendedores: FeriaVendedor[] = JSON.parse(vendedoresData)
    const vendedoresAprobados = vendedores.filter(
      v => v.feriaId === feriaId && v.estado === "aprobado"
    )
    
    const productosIds = vendedoresAprobados.flatMap(v => v.productosIds)
    return new Set(productosIds).size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ferias y Eventos Especiales</h2>
          <p className="text-muted-foreground">
            Descubre ofertas exclusivas y productos únicos en nuestros eventos
          </p>
        </div>
      </div>

      {/* Ferias activas */}
      {ferias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay ferias activas en este momento</p>
            <p className="text-sm text-muted-foreground">
              Vuelve pronto para ver nuevos eventos especiales
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ferias.map((feria) => (
            <Card 
              key={feria.id} 
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => openFeriaDialog(feria)}
            >
              {feria.imagen && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feria.imagen}
                    alt={feria.nombre}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500">Activa</Badge>
                  </div>
                </div>
              )}
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feria.nombre}
                  </CardTitle>
                  {!feria.imagen && (
                    <Badge className="bg-green-500 w-fit">Activa</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {feria.descripcion}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatearFecha(feria.fechaInicio)} - {formatearFecha(feria.fechaFin)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span>{getVendedoresCount(feria.id)} vendedores participando</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{getProductosCount(feria.id)} productos disponibles</span>
                  </div>
                </div>

                {(feria.descuentoMinimo || feria.descuentoMaximo) && (
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Hasta {feria.descuentoMaximo}% de descuento
                      </p>
                      <p className="text-xs text-green-700">
                        En productos seleccionados
                      </p>
                    </div>
                  </div>
                )}

                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Productos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de Feria con Productos */}
      <Dialog open={showFeriaDialog} onOpenChange={setShowFeriaDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedFeria?.nombre}</DialogTitle>
          </DialogHeader>

          {selectedFeria && (
            <div className="flex-1 overflow-y-auto space-y-6 py-4">
              {/* Info de la feria */}
              <div className="space-y-4">
                <p className="text-muted-foreground">{selectedFeria.descripcion}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatearFecha(selectedFeria.fechaInicio)} - {formatearFecha(selectedFeria.fechaFin)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedFeria.categorias.join(", ")}</span>
                  </div>
                </div>

                {(selectedFeria.descuentoMinimo || selectedFeria.descuentoMaximo) && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Descuentos desde {selectedFeria.descuentoMinimo}% hasta {selectedFeria.descuentoMaximo}%
                    </span>
                  </div>
                )}
              </div>

              {/* Filtros */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="todas">Todas las categorías</option>
                      {categoriasDisponibles.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {filteredFeriaProducts.length} productos encontrados
                </div>
              </div>

              {/* Grid de productos */}
              {filteredFeriaProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No se encontraron productos</p>
                  <p className="text-sm text-muted-foreground">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFeriaProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative aspect-square">
                        {product.imagen ? (
                          <Image
                            src={product.imagen}
                            alt={product.nombre}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        {product.descuento && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-500">-{product.descuento}%</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold line-clamp-1">{product.nombre}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.descripcion}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            {product.descuento && product.precioDescuento ? (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground line-through">
                                  €{product.precio.toFixed(2)}
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                  €{product.precioDescuento.toFixed(2)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-lg font-bold">€{product.precio.toFixed(2)}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {product.stock} disponibles
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          <Store className="h-3 w-3 inline mr-1" />
                          {product.vendedor}
                        </p>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              openProductDialog(product)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToCart(product)
                            }}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Añadir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setShowFeriaDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalle del producto */}
      {selectedProduct && (
        <ProductDetailDialog
          product={selectedProduct}
          open={showProductDialog}
          onClose={() => {
            setShowProductDialog(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}
