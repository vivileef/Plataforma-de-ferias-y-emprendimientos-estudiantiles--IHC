"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProducts } from "@/components/products-context"
import { useToast } from "@/hooks/use-toast"
import { 
  Package, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Archive,
  History,
  AlertCircle
} from "lucide-react"
import Image from "next/image"

interface ProductStatus {
  estado: "activo" | "inactivo" | "eliminado"
  razon?: string
  fecha: string
  adminEmail: string
}

type Product = ReturnType<typeof useProducts>['products'][0]

interface ProductWithStatus extends Product {
  status?: ProductStatus[]
  estadoActual?: "activo" | "inactivo" | "eliminado"
}

export function ProductManagement() {
  const { products, updateProduct, deleteProduct } = useProducts()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activo" | "inactivo" | "eliminado">("todos")
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStatus | null>(null)
  const [razonDesactivacion, setRazonDesactivacion] = useState("")
  const [motivoSeleccionado, setMotivoSeleccionado] = useState("")

  // Cargar productos con sus estados desde localStorage
  const [productsWithStatus, setProductsWithStatus] = useState<ProductWithStatus[]>([])

  useEffect(() => {
    const loadProductsStatus = () => {
      const statusData = localStorage.getItem("marketplace_products_status")
      const statusMap: Record<string, ProductStatus[]> = statusData ? JSON.parse(statusData) : {}
      
      const productsData = products.map(product => {
        const status = statusMap[product.id] || []
        const estadoActual = status.length > 0 ? status[status.length - 1].estado : "activo"
        return {
          ...product,
          status,
          estadoActual
        }
      })
      
      setProductsWithStatus(productsData)
    }

    loadProductsStatus()
  }, [products])

  const saveProductStatus = (productId: string, newStatus: ProductStatus) => {
    const statusData = localStorage.getItem("marketplace_products_status")
    const statusMap: Record<string, ProductStatus[]> = statusData ? JSON.parse(statusData) : {}
    
    if (!statusMap[productId]) {
      statusMap[productId] = []
    }
    
    statusMap[productId].push(newStatus)
    localStorage.setItem("marketplace_products_status", JSON.stringify(statusMap))
  }

  const handleDesactivarProducto = () => {
    if (!selectedProduct) return

    if (!motivoSeleccionado || !razonDesactivacion.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const newStatus: ProductStatus = {
      estado: "inactivo",
      razon: `${motivoSeleccionado}: ${razonDesactivacion}`,
      fecha: new Date().toISOString(),
      adminEmail: "admin@gmail.com"
    }

    saveProductStatus(selectedProduct.id, newStatus)

    toast({
      title: "Producto desactivado",
      description: `${selectedProduct.name} ha sido desactivado del catálogo`,
    })

    setShowDeactivateDialog(false)
    setRazonDesactivacion("")
    setMotivoSeleccionado("")
    setSelectedProduct(null)
    
    // Recargar datos
    window.location.reload()
  }

  const handleActivarProducto = (product: ProductWithStatus) => {
    const newStatus: ProductStatus = {
      estado: "activo",
      razon: "Producto reactivado",
      fecha: new Date().toISOString(),
      adminEmail: "admin@gmail.com"
    }

    saveProductStatus(product.id, newStatus)

    toast({
      title: "Producto activado",
      description: `${product.name} está nuevamente disponible en el catálogo`,
    })

    // Recargar datos
    window.location.reload()
  }

  const handleEliminarProducto = () => {
    if (!selectedProduct) return

    const newStatus: ProductStatus = {
      estado: "eliminado",
      razon: "Producto eliminado permanentemente por el administrador",
      fecha: new Date().toISOString(),
      adminEmail: "admin@gmail.com"
    }

    saveProductStatus(selectedProduct.id, newStatus)
    deleteProduct(selectedProduct.id)

    toast({
      title: "Producto eliminado",
      description: `${selectedProduct.name} ha sido eliminado del sistema`,
    })

    setShowDeleteDialog(false)
    setSelectedProduct(null)
  }

  const productosFiltrados = productsWithStatus.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEstado = 
      filtroEstado === "todos" || product.estadoActual === filtroEstado

    return matchesSearch && matchesEstado
  })

  const getEstadoBadge = (estado?: "activo" | "inactivo" | "eliminado") => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge>
      case "inactivo":
        return <Badge className="bg-orange-500"><Archive className="h-3 w-3 mr-1" />Inactivo</Badge>
      case "eliminado":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Eliminado</Badge>
      default:
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge>
    }
  }

  const stats = {
    total: productsWithStatus.length,
    activos: productsWithStatus.filter(p => p.estadoActual === "activo").length,
    inactivos: productsWithStatus.filter(p => p.estadoActual === "inactivo").length,
    eliminados: productsWithStatus.filter(p => p.estadoActual === "eliminado").length,
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <Archive className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inactivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eliminados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.eliminados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Buscar producto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, categoría o vendedor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtroEstado} onValueChange={(v: any) => setFiltroEstado(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                  <SelectItem value="eliminado">Eliminados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos ({productosFiltrados.length})</CardTitle>
          <CardDescription>
            Visualiza y gestiona el estado de los productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron productos con los filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {productosFiltrados.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image 
                      src={product.image || "/placeholder.svg"} 
                      alt={product.name} 
                      fill 
                      sizes="80px"
                      className="object-cover" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      {getEstadoBadge(product.estadoActual)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Vendedor: {product.seller}</span>
                      <span>•</span>
                      <span>Categoría: {product.category}</span>
                      <span>•</span>
                      <span>Precio: €{product.price.toFixed(2)}</span>
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                    {product.status && product.status.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Último cambio: {new Date(product.status[product.status.length - 1].fecha).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {product.estadoActual === "activo" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowDeactivateDialog(true)
                        }}
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Desactivar
                      </Button>
                    ) : product.estadoActual === "inactivo" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivarProducto(product)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Activar
                      </Button>
                    ) : null}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowHistoryDialog(true)
                      }}
                    >
                      <History className="h-4 w-4" />
                    </Button>

                    {product.estadoActual !== "eliminado" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowDeleteDialog(true)
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Desactivar Producto */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Desactivar Producto</DialogTitle>
            <DialogDescription>
              El producto no será visible para los compradores pero se conservará su historial
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">Por {selectedProduct.seller}</p>
              </div>

              <div className="space-y-2">
                <Label>Motivo de desactivación *</Label>
                <Select value={motivoSeleccionado} onValueChange={setMotivoSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Sin stock disponible</SelectItem>
                    <SelectItem value="calidad">Problema de calidad</SelectItem>
                    <SelectItem value="actualizacion">En actualización</SelectItem>
                    <SelectItem value="temporal">Pausa temporal</SelectItem>
                    <SelectItem value="proveedor">Problema con proveedor</SelectItem>
                    <SelectItem value="legal">Requisito legal</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Detalles adicionales *</Label>
                <Textarea
                  placeholder="Describe la razón de la desactivación..."
                  value={razonDesactivacion}
                  onChange={(e) => setRazonDesactivacion(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Esta información se guardará en el historial del producto
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-medium mb-1">Información importante</p>
                    <p className="text-xs">
                      El producto quedará oculto para los compradores pero podrás reactivarlo en cualquier momento.
                      Todo el historial se conserva para trazabilidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeactivateDialog(false)
              setRazonDesactivacion("")
              setMotivoSeleccionado("")
            }}>
              Cancelar
            </Button>
            <Button onClick={handleDesactivarProducto}>
              Desactivar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar Producto */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto del sistema. Se conservará el historial pero el producto
              no podrá ser reactivado. Esta acción es irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedProduct && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-muted-foreground">Por {selectedProduct.seller}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarProducto} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Historial */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial de Cambios</DialogTitle>
            <DialogDescription>
              Registro completo de cambios de estado del producto
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">Por {selectedProduct.seller}</p>
              </div>

              {selectedProduct.status && selectedProduct.status.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...selectedProduct.status].reverse().map((status, index) => (
                    <div key={index} className="flex gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {status.estado === "activo" && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {status.estado === "inactivo" && <Archive className="h-5 w-5 text-orange-600" />}
                        {status.estado === "eliminado" && <XCircle className="h-5 w-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{status.estado}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(status.fecha).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{status.razon}</p>
                        <p className="text-xs text-muted-foreground mt-1">Por: {status.adminEmail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay cambios de estado registrados</p>
                  <p className="text-xs mt-1">Este producto ha estado activo desde su creación</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
