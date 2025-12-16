"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getSession } from "@/components/auth/users"
import { 
  Gift, 
  Ticket, 
  TrendingUp, 
  Plus, 
  Calendar, 
  Copy, 
  Trash2,
  Eye,
  BarChart3,
  Users,
  CheckCircle2
} from "lucide-react"

interface Promocion {
  id: string
  vendedorEmail: string
  nombre: string
  tipo: "cupon" | "sorteo" | "preventa"
  codigo?: string
  descripcion: string
  descuento: number // porcentaje
  fechaInicio: string
  fechaFin: string
  limiteUsos?: number
  usosActuales: number
  estado: "activa" | "expirada" | "agotada"
  condiciones?: string
  fechaCreacion: string
}

export function PromocionesVendedor() {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [filtro, setFiltro] = useState<"todas" | "activa" | "expirada" | "agotada">("todas")
  const [showCrearDialog, setShowCrearDialog] = useState(false)
  const [showDetalleDialog, setShowDetalleDialog] = useState(false)
  const [promocionSeleccionada, setPromocionSeleccionada] = useState<Promocion | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "cupon" as "cupon" | "sorteo" | "preventa",
    codigo: "",
    descripcion: "",
    descuento: "",
    fechaInicio: "",
    fechaFin: "",
    limiteUsos: "",
    condiciones: "",
  })

  useEffect(() => {
    loadPromociones()
  }, [])

  const loadPromociones = () => {
    const session = getSession()
    if (!session) return

    const stored = localStorage.getItem("marketplace_promociones")
    const allPromociones: Promocion[] = stored ? JSON.parse(stored) : []
    
    // Filtrar por vendedor y actualizar estados
    const misPromociones = allPromociones
      .filter(p => p.vendedorEmail === session.email)
      .map(p => {
        // Obtener solo la fecha actual sin hora (medianoche local)
        const ahora = new Date()
        ahora.setHours(0, 0, 0, 0)
        
        // Crear fecha de fin en zona horaria local
        const fechaFin = new Date(p.fechaFin + 'T23:59:59')
        
        if (p.limiteUsos && p.usosActuales >= p.limiteUsos) {
          return { ...p, estado: "agotada" as const }
        } else if (fechaFin < ahora) {
          return { ...p, estado: "expirada" as const }
        } else {
          return { ...p, estado: "activa" as const }
        }
      })

    setPromociones(misPromociones)
  }

  const generarCodigoAleatorio = () => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let codigo = ""
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    }
    return codigo
  }

  const handleCrearPromocion = (e: React.FormEvent) => {
    e.preventDefault()
    const session = getSession()
    if (!session) {
      toast({
        title: "Error",
        description: "No hay sesión activa. Por favor inicia sesión nuevamente.",
        variant: "destructive",
      })
      return
    }

    // Validaciones
    if (!formData.nombre || !formData.tipo || !formData.descuento || !formData.fechaInicio || !formData.fechaFin) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const fechaInicio = new Date(formData.fechaInicio)
    const fechaFin = new Date(formData.fechaFin)
    
    if (fechaFin <= fechaInicio) {
      toast({
        title: "Error",
        description: "La fecha de fin debe ser posterior a la fecha de inicio",
        variant: "destructive",
      })
      return
    }

    const nuevaPromocion: Promocion = {
      id: `PROMO-${Date.now()}`,
      vendedorEmail: session.email,
      nombre: formData.nombre,
      tipo: formData.tipo,
      codigo: formData.tipo === "cupon" ? (formData.codigo || generarCodigoAleatorio()) : undefined,
      descripcion: formData.descripcion,
      descuento: Number.parseFloat(formData.descuento),
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      limiteUsos: formData.limiteUsos ? Number.parseInt(formData.limiteUsos, 10) : undefined,
      usosActuales: 0,
      estado: "activa",
      condiciones: formData.condiciones,
      fechaCreacion: new Date().toISOString(),
    }

    const stored = localStorage.getItem("marketplace_promociones")
    const promociones: Promocion[] = stored ? JSON.parse(stored) : []
    promociones.push(nuevaPromocion)
    localStorage.setItem("marketplace_promociones", JSON.stringify(promociones))

    toast({
      title: "¡Promoción creada!",
      description: `${formData.nombre} ha sido creada exitosamente`,
    })

    setShowCrearDialog(false)
    resetForm()
    loadPromociones()
  }

  const handleEliminarPromocion = (id: string) => {
    const stored = localStorage.getItem("marketplace_promociones")
    const promociones: Promocion[] = stored ? JSON.parse(stored) : []
    const updated = promociones.filter(p => p.id !== id)
    localStorage.setItem("marketplace_promociones", JSON.stringify(updated))

    toast({
      title: "Promoción eliminada",
      description: "La promoción ha sido eliminada exitosamente",
    })

    loadPromociones()
  }

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo)
    toast({
      title: "Código copiado",
      description: "El código ha sido copiado al portapapeles",
    })
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipo: "cupon",
      codigo: "",
      descripcion: "",
      descuento: "",
      fechaInicio: "",
      fechaFin: "",
      limiteUsos: "",
      condiciones: "",
    })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activa":
        return "bg-green-500"
      case "expirada":
        return "bg-gray-500"
      case "agotada":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "cupon":
        return <Ticket className="h-5 w-5" />
      case "sorteo":
        return <Gift className="h-5 w-5" />
      case "preventa":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Gift className="h-5 w-5" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "cupon":
        return "Cupón de Descuento"
      case "sorteo":
        return "Sorteo"
      case "preventa":
        return "Preventa"
      default:
        return tipo
    }
  }

  const formatearFecha = (fechaStr: string) => {
    // Agregar hora para evitar problemas de zona horaria
    const fecha = new Date(fechaStr + 'T00:00:00')
    return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const promocionesFiltradas = promociones.filter(p => 
    filtro === "todas" ? true : p.estado === filtro
  )

  const stats = {
    total: promociones.length,
    activas: promociones.filter(p => p.estado === "activa").length,
    expiradas: promociones.filter(p => p.estado === "expirada").length,
    usosTotal: promociones.reduce((sum, p) => sum + p.usosActuales, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promociones y Cupones</h2>
          <p className="text-muted-foreground mt-1">
            Crea y gestiona promociones para tus productos
          </p>
        </div>
        <Button 
          onClick={() => {
            console.log("Abriendo diálogo de crear promoción")
            setShowCrearDialog(true)
          }} 
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Crear Promoción
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promociones</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.expiradas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usos Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usosTotal}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">
            Todas ({promociones.length})
          </TabsTrigger>
          <TabsTrigger value="activa">
            Activas ({stats.activas})
          </TabsTrigger>
          <TabsTrigger value="expirada">
            Expiradas ({stats.expiradas})
          </TabsTrigger>
          <TabsTrigger value="agotada">
            Agotadas ({promociones.filter(p => p.estado === "agotada").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filtro} className="mt-6">
          {promocionesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No hay promociones {filtro !== "todas" && filtro}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crea tu primera promoción para atraer más clientes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promocionesFiltradas.map((promo) => (
                <Card key={promo.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-20 h-20 ${getEstadoColor(promo.estado)} opacity-10 rounded-bl-full`} />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTipoIcon(promo.tipo)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{promo.nombre}</CardTitle>
                          <p className="text-xs text-muted-foreground">{getTipoLabel(promo.tipo)}</p>
                        </div>
                      </div>
                      <Badge className={getEstadoColor(promo.estado)}>
                        {promo.estado}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-center py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">-{promo.descuento}%</p>
                        <p className="text-xs text-muted-foreground">Descuento</p>
                      </div>
                    </div>

                    {promo.codigo && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <code className="flex-1 text-sm font-mono font-bold">{promo.codigo}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copiarCodigo(promo.codigo!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatearFecha(promo.fechaInicio)} - {formatearFecha(promo.fechaFin)}
                        </span>
                      </div>
                      
                      {promo.limiteUsos && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            {promo.usosActuales} / {promo.limiteUsos} usos
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setPromocionSeleccionada(promo)
                          setShowDetalleDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleEliminarPromocion(promo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Crear Promoción */}
      <Dialog open={showCrearDialog} onOpenChange={setShowCrearDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Promoción</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCrearPromocion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Promoción *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Oferta de Verano"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Promoción *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cupon">Cupón de Descuento</SelectItem>
                  <SelectItem value="sorteo">Sorteo</SelectItem>
                  <SelectItem value="preventa">Preventa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipo === "cupon" && (
              <div className="space-y-2">
                <Label htmlFor="codigo">Código del Cupón</Label>
                <div className="flex gap-2">
                  <Input
                    id="codigo"
                    placeholder="VERANO2024"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, codigo: generarCodigoAleatorio() })}
                  >
                    Generar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deja vacío para generar automáticamente
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe tu promoción..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descuento">Descuento (%) *</Label>
                <Input
                  id="descuento"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="15"
                  value={formData.descuento}
                  onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limiteUsos">Límite de Usos</Label>
                <Input
                  id="limiteUsos"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.limiteUsos}
                  onChange={(e) => setFormData({ ...formData, limiteUsos: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de Fin *</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condiciones">Condiciones y Términos</Label>
              <Textarea
                id="condiciones"
                placeholder="Ej: Válido solo para productos seleccionados..."
                value={formData.condiciones}
                onChange={(e) => setFormData({ ...formData, condiciones: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCrearDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Promoción</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalle Promoción */}
      <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Promoción</DialogTitle>
          </DialogHeader>
          
          {promocionSeleccionada && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{promocionSeleccionada.nombre}</h3>
                <Badge className={getEstadoColor(promocionSeleccionada.estado)}>
                  {promocionSeleccionada.estado}
                </Badge>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-4xl font-bold text-primary">-{promocionSeleccionada.descuento}%</p>
                <p className="text-sm text-muted-foreground mt-1">{getTipoLabel(promocionSeleccionada.tipo)}</p>
              </div>

              {promocionSeleccionada.codigo && (
                <div>
                  <Label>Código</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mt-1">
                    <code className="flex-1 text-lg font-mono font-bold">{promocionSeleccionada.codigo}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copiarCodigo(promocionSeleccionada.codigo!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label>Descripción</Label>
                <p className="text-sm text-muted-foreground mt-1">{promocionSeleccionada.descripcion || "Sin descripción"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Inicio</Label>
                  <p className="text-sm mt-1">{formatearFecha(promocionSeleccionada.fechaInicio)}</p>
                </div>
                <div>
                  <Label>Fecha de Fin</Label>
                  <p className="text-sm mt-1">{formatearFecha(promocionSeleccionada.fechaFin)}</p>
                </div>
              </div>

              {promocionSeleccionada.limiteUsos && (
                <div>
                  <Label>Usos</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(promocionSeleccionada.usosActuales / promocionSeleccionada.limiteUsos) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {promocionSeleccionada.usosActuales} / {promocionSeleccionada.limiteUsos}
                    </span>
                  </div>
                </div>
              )}

              {promocionSeleccionada.condiciones && (
                <div>
                  <Label>Condiciones</Label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                    {promocionSeleccionada.condiciones}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Creada el {new Date(promocionSeleccionada.fechaCreacion).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
