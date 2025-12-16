"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProducts } from "@/components/products-context"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar,
  Tag,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Send
} from "lucide-react"

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

export function FeriasVendedor() {
  const { products } = useProducts()
  const { toast } = useToast()
  const [ferias, setFerias] = useState<Feria[]>([])
  const [inscripciones, setInscripciones] = useState<FeriaVendedor[]>([])
  const [showInscripcionDialog, setShowInscripcionDialog] = useState(false)
  const [showProductosDialog, setShowProductosDialog] = useState(false)
  const [selectedFeria, setSelectedFeria] = useState<Feria | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [vendedorEmail, setVendedorEmail] = useState("")

  useEffect(() => {
    // Obtener email del vendedor desde sesión
    const sessionData = localStorage.getItem("marketplace_session")
    if (sessionData) {
      const session = JSON.parse(sessionData)
      setVendedorEmail(session.email)
    }

    loadFerias()
    loadInscripciones()
  }, [])

  const loadFerias = () => {
    const feriasData = localStorage.getItem("marketplace_ferias")
    if (feriasData) {
      const feriasArray: Feria[] = JSON.parse(feriasData)
      
      // Solo mostrar ferias activas y programadas
      const feriasDisponibles = feriasArray.filter(
        f => f.estado === "activa" || f.estado === "programada"
      )
      
      setFerias(feriasDisponibles)
    }
  }

  const loadInscripciones = () => {
    const inscripcionesData = localStorage.getItem("marketplace_ferias_vendedores")
    if (inscripcionesData && vendedorEmail) {
      const inscripcionesArray: FeriaVendedor[] = JSON.parse(inscripcionesData)
      const misInscripciones = inscripcionesArray.filter(
        i => i.vendedorEmail === vendedorEmail
      )
      setInscripciones(misInscripciones)
    }
  }

  useEffect(() => {
    if (vendedorEmail) {
      loadInscripciones()
    }
  }, [vendedorEmail])

  const handleInscribirse = () => {
    if (!selectedFeria || !vendedorEmail) return

    // Verificar si ya está inscrito
    const yaInscrito = inscripciones.some(i => i.feriaId === selectedFeria.id)
    if (yaInscrito) {
      toast({
        title: "Ya estás inscrito",
        description: "Ya tienes una solicitud para esta feria",
        variant: "destructive"
      })
      return
    }

    // Verificar si tiene productos en las categorías de la feria
    const productosCompatibles = products.filter(p => 
      selectedFeria.categorias.includes(p.categoria)
    )

    if (productosCompatibles.length === 0) {
      toast({
        title: "Sin productos compatibles",
        description: "No tienes productos en las categorías aceptadas por esta feria",
        variant: "destructive"
      })
      return
    }

    const nuevaInscripcion: FeriaVendedor = {
      feriaId: selectedFeria.id,
      vendedorEmail: vendedorEmail,
      fechaInscripcion: new Date().toISOString(),
      estado: "pendiente",
      productosIds: []
    }

    const inscripcionesData = localStorage.getItem("marketplace_ferias_vendedores")
    const inscripcionesArray: FeriaVendedor[] = inscripcionesData 
      ? JSON.parse(inscripcionesData) 
      : []
    
    inscripcionesArray.push(nuevaInscripcion)
    localStorage.setItem("marketplace_ferias_vendedores", JSON.stringify(inscripcionesArray))
    
    setInscripciones([...inscripciones, nuevaInscripcion])

    toast({
      title: "¡Solicitud enviada!",
      description: "Tu solicitud de inscripción ha sido enviada. Espera la aprobación del administrador."
    })

    setShowInscripcionDialog(false)
    setSelectedFeria(null)
  }

  const handleAgregarProductos = () => {
    if (!selectedFeria || selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un producto",
        variant: "destructive"
      })
      return
    }

    const inscripcionesData = localStorage.getItem("marketplace_ferias_vendedores")
    if (!inscripcionesData) return

    const inscripcionesArray: FeriaVendedor[] = JSON.parse(inscripcionesData)
    const inscripcionIndex = inscripcionesArray.findIndex(
      i => i.feriaId === selectedFeria.id && i.vendedorEmail === vendedorEmail
    )

    if (inscripcionIndex === -1) return

    inscripcionesArray[inscripcionIndex].productosIds = selectedProducts
    localStorage.setItem("marketplace_ferias_vendedores", JSON.stringify(inscripcionesArray))

    // Actualizar estado local
    const inscripcionesActualizadas = inscripciones.map(i =>
      i.feriaId === selectedFeria.id 
        ? { ...i, productosIds: selectedProducts }
        : i
    )
    setInscripciones(inscripcionesActualizadas)

    toast({
      title: "Productos actualizados",
      description: `${selectedProducts.length} productos agregados a la feria`
    })

    setShowProductosDialog(false)
    setSelectedFeria(null)
    setSelectedProducts([])
  }

  const openInscripcionDialog = (feria: Feria) => {
    setSelectedFeria(feria)
    setShowInscripcionDialog(true)
  }

  const openProductosDialog = (feria: Feria) => {
    setSelectedFeria(feria)
    
    // Cargar productos ya seleccionados
    const inscripcion = inscripciones.find(i => i.feriaId === feria.id)
    if (inscripcion) {
      setSelectedProducts(inscripcion.productosIds)
    }
    
    setShowProductosDialog(true)
  }

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const getInscripcion = (feriaId: string) => {
    return inscripciones.find(i => i.feriaId === feriaId)
  }

  const getEstadoBadge = (estado: FeriaVendedor["estado"]) => {
    const config = {
      pendiente: { label: "Pendiente", color: "bg-yellow-500" },
      aprobado: { label: "Aprobado", color: "bg-green-500" },
      rechazado: { label: "Rechazado", color: "bg-red-500" }
    }
    
    const { label, color } = config[estado]
    return <Badge className={color}>{label}</Badge>
  }

  const getEstadoFeriaBadge = (estado: Feria["estado"]) => {
    const config = {
      activa: { label: "Activa", color: "bg-green-500" },
      programada: { label: "Programada", color: "bg-blue-500" },
      inactiva: { label: "Inactiva", color: "bg-orange-500" },
      cerrada: { label: "Cerrada", color: "bg-red-500" }
    }
    
    const { label, color } = config[estado]
    return <Badge className={color}>{label}</Badge>
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Filtrar productos compatibles con la feria seleccionada
  const getProductosCompatibles = (feria: Feria) => {
    return products.filter(p => feria.categorias.includes(p.categoria))
  }

  // Ferias donde el vendedor está inscrito
  const feriasInscritas = ferias.filter(f => 
    inscripciones.some(i => i.feriaId === f.id)
  )

  // Ferias disponibles para inscribirse
  const feriasDisponibles = ferias.filter(f => 
    !inscripciones.some(i => i.feriaId === f.id)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ferias y Eventos</h2>
        <p className="text-muted-foreground">
          Participa en eventos especiales y aumenta tu visibilidad
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscripciones</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inscripciones.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inscripciones.filter(i => i.estado === "aprobado").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ferias Disponibles</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feriasDisponibles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="disponibles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="disponibles">
            Disponibles ({feriasDisponibles.length})
          </TabsTrigger>
          <TabsTrigger value="inscritas">
            Mis Inscripciones ({feriasInscritas.length})
          </TabsTrigger>
        </TabsList>

        {/* Ferias Disponibles */}
        <TabsContent value="disponibles" className="space-y-4">
          {feriasDisponibles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay ferias disponibles</p>
                <p className="text-sm text-muted-foreground">
                  Las nuevas ferias aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {feriasDisponibles.map((feria) => (
                <Card key={feria.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{feria.nombre}</CardTitle>
                        {getEstadoFeriaBadge(feria.estado)}
                      </div>
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
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>{feria.categorias.length} categorías</span>
                      </div>

                      {getProductosCompatibles(feria).length > 0 && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <span className="text-green-700">
                            {getProductosCompatibles(feria).length} productos compatibles
                          </span>
                        </div>
                      )}
                    </div>

                    {(feria.descuentoMinimo || feria.descuentoMaximo) && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Descuentos sugeridos: {feria.descuentoMinimo}% - {feria.descuentoMaximo}%
                        </span>
                      </div>
                    )}

                    {feria.reglas && (
                      <div className="text-xs text-muted-foreground">
                        <FileText className="h-3 w-3 inline mr-1" />
                        Ver reglas en el formulario de inscripción
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => openInscripcionDialog(feria)}
                      disabled={getProductosCompatibles(feria).length === 0}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Inscribirme
                    </Button>

                    {getProductosCompatibles(feria).length === 0 && (
                      <p className="text-xs text-red-500 text-center">
                        No tienes productos en las categorías aceptadas
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Mis Inscripciones */}
        <TabsContent value="inscritas" className="space-y-4">
          {feriasInscritas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No tienes inscripciones</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Inscríbete en una feria para comenzar
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="disponibles"]')?.click()}>
                  Ver Ferias Disponibles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {feriasInscritas.map((feria) => {
                const inscripcion = getInscripcion(feria.id)
                if (!inscripcion) return null

                return (
                  <Card key={feria.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{feria.nombre}</CardTitle>
                          <div className="flex gap-2">
                            {getEstadoFeriaBadge(feria.estado)}
                            {getEstadoBadge(inscripcion.estado)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {feria.descripcion}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatearFecha(feria.fechaInicio)} - {formatearFecha(feria.fechaFin)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{inscripcion.productosIds.length} productos añadidos</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Inscrito: {new Date(inscripcion.fechaInscripcion).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>

                      {inscripcion.estado === "aprobado" && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => openProductosDialog(feria)}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Gestionar Productos
                        </Button>
                      )}

                      {inscripcion.estado === "pendiente" && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700">
                            Esperando aprobación
                          </span>
                        </div>
                      )}

                      {inscripcion.estado === "rechazado" && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700">
                            Solicitud rechazada
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo Inscripción */}
      <Dialog open={showInscripcionDialog} onOpenChange={setShowInscripcionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inscribirse a {selectedFeria?.nombre}</DialogTitle>
            <DialogDescription>
              Lee cuidadosamente las reglas y lineamientos antes de inscribirte
            </DialogDescription>
          </DialogHeader>

          {selectedFeria && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Descripción</h3>
                <p className="text-sm text-muted-foreground">{selectedFeria.descripcion}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período del Evento
                </h3>
                <p className="text-sm">
                  Del {formatearFecha(selectedFeria.fechaInicio)} al {formatearFecha(selectedFeria.fechaFin)}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categorías Aceptadas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFeria.categorias.map(cat => (
                    <Badge key={cat} variant="outline">{cat}</Badge>
                  ))}
                </div>
              </div>

              {(selectedFeria.descuentoMinimo || selectedFeria.descuentoMaximo) && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Descuentos Sugeridos
                  </h3>
                  <p className="text-sm">
                    Se recomienda ofrecer descuentos entre {selectedFeria.descuentoMinimo}% y {selectedFeria.descuentoMaximo}%
                  </p>
                </div>
              )}

              {selectedFeria.reglas && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Reglas de Participación
                  </h3>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedFeria.reglas}</p>
                  </div>
                </div>
              )}

              {selectedFeria.lineamientos && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Lineamientos Generales
                  </h3>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedFeria.lineamientos}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-md">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tu solicitud será revisada por el administrador</li>
                    <li>Una vez aprobado, podrás añadir tus productos a la feria</li>
                    <li>Solo productos en las categorías aceptadas serán permitidos</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInscripcionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInscribirse}>
              <Send className="mr-2 h-4 w-4" />
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Gestionar Productos */}
      <Dialog open={showProductosDialog} onOpenChange={setShowProductosDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Productos - {selectedFeria?.nombre}</DialogTitle>
            <DialogDescription>
              Selecciona los productos que quieres mostrar en esta feria
            </DialogDescription>
          </DialogHeader>

          {selectedFeria && (
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground">
                Solo se muestran productos compatibles con las categorías de la feria
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getProductosCompatibles(selectedFeria).map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={product.id}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <Label 
                      htmlFor={product.id} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {product.imagen && (
                          <img 
                            src={product.imagen} 
                            alt={product.nombre}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{product.nombre}</p>
                          <p className="text-sm text-muted-foreground">{product.categoria}</p>
                          <p className="text-sm font-medium mt-1">€{product.precio}</p>
                          {product.descuento && (
                            <Badge variant="outline" className="mt-1 bg-green-50">
                              {product.descuento}% descuento
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>

              {getProductosCompatibles(selectedFeria).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes productos compatibles con esta feria</p>
                </div>
              )}

              <div className="text-sm font-medium">
                {selectedProducts.length} productos seleccionados
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProductosDialog(false)
                setSelectedProducts([])
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAgregarProductos}>
              Guardar Productos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
