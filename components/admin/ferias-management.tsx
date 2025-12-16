"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Users,
  Package,
  TrendingUp,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  FileText,
  BarChart3
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

interface FeriaStats {
  vendedoresInscritos: number
  vendedoresAprobados: number
  productosTotal: number
  ventasGeneradas: number
}

const CATEGORIAS_DISPONIBLES = [
  "Artesanías",
  "Ropa y Accesorios",
  "Joyería",
  "Decoración",
  "Arte",
  "Alimentos",
  "Tecnología",
  "Libros",
  "Juguetes",
  "Belleza",
  "Hogar",
  "Otros"
]

export function FeriasManagement() {
  const { toast } = useToast()
  const [ferias, setFerias] = useState<Feria[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatsDialog, setShowStatsDialog] = useState(false)
  const [selectedFeria, setSelectedFeria] = useState<Feria | null>(null)
  const [feriaStats, setFeriaStats] = useState<FeriaStats | null>(null)
  
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    categorias: [] as string[],
    reglas: "",
    lineamientos: "",
    imagen: "",
    descuentoMinimo: "",
    descuentoMaximo: ""
  })

  // Cargar ferias desde localStorage
  useEffect(() => {
    loadFerias()
  }, [])

  const loadFerias = () => {
    const feriasData = localStorage.getItem("marketplace_ferias")
    if (feriasData) {
      const feriasArray: Feria[] = JSON.parse(feriasData)
      
      // Actualizar estados automáticamente basado en fechas
      const ahora = new Date()
      ahora.setHours(0, 0, 0, 0)
      
      const feriasActualizadas = feriasArray.map(feria => {
        if (feria.estado === "cerrada") return feria
        
        const inicio = new Date(feria.fechaInicio + 'T00:00:00')
        const fin = new Date(feria.fechaFin + 'T23:59:59')
        
        if (ahora < inicio) {
          return { ...feria, estado: "programada" as const }
        } else if (ahora >= inicio && ahora <= fin && feria.estado !== "inactiva") {
          return { ...feria, estado: "activa" as const }
        } else if (ahora > fin) {
          return { ...feria, estado: "cerrada" as const }
        }
        
        return feria
      })
      
      setFerias(feriasActualizadas)
      localStorage.setItem("marketplace_ferias", JSON.stringify(feriasActualizadas))
    }
  }

  const generarIdFeria = () => {
    return `feria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleCrearFeria = () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la feria es obligatorio",
        variant: "destructive"
      })
      return
    }

    if (!formData.fechaInicio || !formData.fechaFin) {
      toast({
        title: "Error",
        description: "Las fechas de inicio y fin son obligatorias",
        variant: "destructive"
      })
      return
    }

    const inicio = new Date(formData.fechaInicio)
    const fin = new Date(formData.fechaFin)
    
    if (fin <= inicio) {
      toast({
        title: "Error",
        description: "La fecha de fin debe ser posterior a la fecha de inicio",
        variant: "destructive"
      })
      return
    }

    if (formData.categorias.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos una categoría",
        variant: "destructive"
      })
      return
    }

    // Determinar estado inicial basado en fecha de inicio
    const ahora = new Date()
    ahora.setHours(0, 0, 0, 0)
    const inicioDate = new Date(formData.fechaInicio + 'T00:00:00')
    const estadoInicial = inicioDate > ahora ? "programada" : "activa"

    const nuevaFeria: Feria = {
      id: generarIdFeria(),
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      categorias: formData.categorias,
      reglas: formData.reglas,
      lineamientos: formData.lineamientos,
      estado: estadoInicial,
      adminEmail: "admin@gmail.com", // En producción, obtener del contexto de autenticación
      fechaCreacion: new Date().toISOString(),
      imagen: formData.imagen || undefined,
      descuentoMinimo: formData.descuentoMinimo ? Number.parseFloat(formData.descuentoMinimo) : undefined,
      descuentoMaximo: formData.descuentoMaximo ? Number.parseFloat(formData.descuentoMaximo) : undefined
    }

    const feriasActuales = [...ferias, nuevaFeria]
    setFerias(feriasActuales)
    localStorage.setItem("marketplace_ferias", JSON.stringify(feriasActuales))

    toast({
      title: "¡Feria creada!",
      description: `La feria "${nuevaFeria.nombre}" ha sido creada exitosamente`
    })

    // Limpiar formulario y cerrar diálogo
    resetForm()
    setShowCreateDialog(false)
  }

  const handleEditarFeria = () => {
    if (!selectedFeria) return

    // Validaciones
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la feria es obligatorio",
        variant: "destructive"
      })
      return
    }

    if (!formData.fechaInicio || !formData.fechaFin) {
      toast({
        title: "Error",
        description: "Las fechas son obligatorias",
        variant: "destructive"
      })
      return
    }

    const inicio = new Date(formData.fechaInicio)
    const fin = new Date(formData.fechaFin)
    
    if (fin <= inicio) {
      toast({
        title: "Error",
        description: "La fecha de fin debe ser posterior a la fecha de inicio",
        variant: "destructive"
      })
      return
    }

    const feriaActualizada: Feria = {
      ...selectedFeria,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      categorias: formData.categorias,
      reglas: formData.reglas,
      lineamientos: formData.lineamientos,
      imagen: formData.imagen || undefined,
      descuentoMinimo: formData.descuentoMinimo ? Number.parseFloat(formData.descuentoMinimo) : undefined,
      descuentoMaximo: formData.descuentoMaximo ? Number.parseFloat(formData.descuentoMaximo) : undefined
    }

    const feriasActualizadas = ferias.map(f => 
      f.id === selectedFeria.id ? feriaActualizada : f
    )

    setFerias(feriasActualizadas)
    localStorage.setItem("marketplace_ferias", JSON.stringify(feriasActualizadas))

    toast({
      title: "Feria actualizada",
      description: "Los cambios se han guardado correctamente"
    })

    setShowEditDialog(false)
    setSelectedFeria(null)
    resetForm()
  }

  const handleEliminarFeria = () => {
    if (!selectedFeria) return

    const feriasActualizadas = ferias.filter(f => f.id !== selectedFeria.id)
    setFerias(feriasActualizadas)
    localStorage.setItem("marketplace_ferias", JSON.stringify(feriasActualizadas))

    // Limpiar datos relacionados
    const vendedoresData = localStorage.getItem("marketplace_ferias_vendedores")
    if (vendedoresData) {
      const vendedores: FeriaVendedor[] = JSON.parse(vendedoresData)
      const vendedoresFiltrados = vendedores.filter(v => v.feriaId !== selectedFeria.id)
      localStorage.setItem("marketplace_ferias_vendedores", JSON.stringify(vendedoresFiltrados))
    }

    toast({
      title: "Feria eliminada",
      description: `La feria "${selectedFeria.nombre}" ha sido eliminada`
    })

    setShowDeleteDialog(false)
    setSelectedFeria(null)
  }

  const handleCambiarEstado = (feria: Feria, nuevoEstado: "activa" | "inactiva") => {
    const feriaActualizada = { ...feria, estado: nuevoEstado }
    const feriasActualizadas = ferias.map(f => 
      f.id === feria.id ? feriaActualizada : f
    )

    setFerias(feriasActualizadas)
    localStorage.setItem("marketplace_ferias", JSON.stringify(feriasActualizadas))

    toast({
      title: nuevoEstado === "activa" ? "Feria activada" : "Feria desactivada",
      description: `La feria "${feria.nombre}" ahora está ${nuevoEstado}`
    })
  }

  const openEditDialog = (feria: Feria) => {
    setSelectedFeria(feria)
    setFormData({
      nombre: feria.nombre,
      descripcion: feria.descripcion,
      fechaInicio: feria.fechaInicio,
      fechaFin: feria.fechaFin,
      categorias: feria.categorias,
      reglas: feria.reglas,
      lineamientos: feria.lineamientos,
      imagen: feria.imagen || "",
      descuentoMinimo: feria.descuentoMinimo?.toString() || "",
      descuentoMaximo: feria.descuentoMaximo?.toString() || ""
    })
    setShowEditDialog(true)
  }

  const openStatsDialog = (feria: Feria) => {
    setSelectedFeria(feria)
    
    // Calcular estadísticas
    const vendedoresData = localStorage.getItem("marketplace_ferias_vendedores")
    let stats: FeriaStats = {
      vendedoresInscritos: 0,
      vendedoresAprobados: 0,
      productosTotal: 0,
      ventasGeneradas: 0
    }

    if (vendedoresData) {
      const vendedores: FeriaVendedor[] = JSON.parse(vendedoresData)
      const vendedoresFeria = vendedores.filter(v => v.feriaId === feria.id)
      
      stats.vendedoresInscritos = vendedoresFeria.length
      stats.vendedoresAprobados = vendedoresFeria.filter(v => v.estado === "aprobado").length
      stats.productosTotal = vendedoresFeria.reduce((sum, v) => sum + v.productosIds.length, 0)
    }

    setFeriaStats(stats)
    setShowStatsDialog(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      categorias: [],
      reglas: "",
      lineamientos: "",
      imagen: "",
      descuentoMinimo: "",
      descuentoMaximo: ""
    })
  }

  const toggleCategoria = (categoria: string) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.includes(categoria)
        ? prev.categorias.filter(c => c !== categoria)
        : [...prev.categorias, categoria]
    }))
  }

  const getEstadoBadge = (estado: Feria["estado"]) => {
    const config = {
      activa: { label: "Activa", color: "bg-green-500" },
      inactiva: { label: "Inactiva", color: "bg-orange-500" },
      cerrada: { label: "Cerrada", color: "bg-red-500" },
      programada: { label: "Programada", color: "bg-blue-500" }
    }
    
    const { label, color } = config[estado]
    return <Badge className={color}>{label}</Badge>
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Estadísticas generales
  const statsGenerales = {
    total: ferias.length,
    activas: ferias.filter(f => f.estado === "activa").length,
    programadas: ferias.filter(f => f.estado === "programada").length,
    cerradas: ferias.filter(f => f.estado === "cerrada").length
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Ferias</h2>
          <p className="text-muted-foreground">
            Administra eventos especiales y campañas coordinadas
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Nueva Feria
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ferias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsGenerales.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsGenerales.activas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programadas</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsGenerales.programadas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsGenerales.cerradas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs por estado */}
      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">
            Todas ({ferias.length})
          </TabsTrigger>
          <TabsTrigger value="activas">
            Activas ({statsGenerales.activas})
          </TabsTrigger>
          <TabsTrigger value="programadas">
            Programadas ({statsGenerales.programadas})
          </TabsTrigger>
          <TabsTrigger value="cerradas">
            Cerradas ({statsGenerales.cerradas})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {ferias.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay ferias creadas</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea tu primera feria para comenzar
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Feria
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ferias.map((feria) => (
                <Card key={feria.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{feria.nombre}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getEstadoBadge(feria.estado)}
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
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>{feria.categorias.length} categorías</span>
                      </div>
                    </div>

                    {(feria.descuentoMinimo || feria.descuentoMaximo) && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Descuentos: {feria.descuentoMinimo}% - {feria.descuentoMaximo}%
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openStatsDialog(feria)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Estadísticas
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(feria)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {feria.estado !== "cerrada" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCambiarEstado(
                            feria, 
                            feria.estado === "activa" ? "inactiva" : "activa"
                          )}
                        >
                          {feria.estado === "activa" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeria(feria)
                          setShowDeleteDialog(true)
                        }}
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

        <TabsContent value="activas">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ferias.filter(f => f.estado === "activa").map((feria) => (
              <Card key={feria.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">{feria.nombre}</CardTitle>
                  {getEstadoBadge(feria.estado)}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {feria.descripcion}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openStatsDialog(feria)}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Ver Stats
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(feria)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="programadas">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ferias.filter(f => f.estado === "programada").map((feria) => (
              <Card key={feria.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">{feria.nombre}</CardTitle>
                  {getEstadoBadge(feria.estado)}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {feria.descripcion}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Inicia: {formatearFecha(feria.fechaInicio)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(feria)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cerradas">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ferias.filter(f => f.estado === "cerrada").map((feria) => (
              <Card key={feria.id} className="overflow-hidden opacity-75">
                <CardHeader>
                  <CardTitle className="text-lg">{feria.nombre}</CardTitle>
                  {getEstadoBadge(feria.estado)}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {feria.descripcion}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Finalizó: {formatearFecha(feria.fechaFin)}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openStatsDialog(feria)}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Resultados
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo Crear/Editar Feria */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false)
          setShowEditDialog(false)
          setSelectedFeria(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? "Editar Feria" : "Crear Nueva Feria"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Información Básica
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Feria *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Feria Navideña 2025"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe brevemente el propósito y temática de la feria..."
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagen">URL de Imagen (opcional)</Label>
                <Input
                  id="imagen"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData.imagen}
                  onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas del Evento
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha de Fin *</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categorías Participantes *
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIAS_DISPONIBLES.map((categoria) => (
                  <div key={categoria} className="flex items-center space-x-2">
                    <Checkbox
                      id={categoria}
                      checked={formData.categorias.includes(categoria)}
                      onCheckedChange={() => toggleCategoria(categoria)}
                    />
                    <Label htmlFor={categoria} className="text-sm cursor-pointer">
                      {categoria}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Descuentos sugeridos */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Descuentos Sugeridos (opcional)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descuentoMinimo">Descuento Mínimo (%)</Label>
                  <Input
                    id="descuentoMinimo"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    value={formData.descuentoMinimo}
                    onChange={(e) => setFormData({ ...formData, descuentoMinimo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descuentoMaximo">Descuento Máximo (%)</Label>
                  <Input
                    id="descuentoMaximo"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="50"
                    value={formData.descuentoMaximo}
                    onChange={(e) => setFormData({ ...formData, descuentoMaximo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Reglas */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reglas y Lineamientos
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="reglas">Reglas de Participación</Label>
                <Textarea
                  id="reglas"
                  placeholder="Especifica las reglas que deben cumplir los vendedores..."
                  rows={4}
                  value={formData.reglas}
                  onChange={(e) => setFormData({ ...formData, reglas: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineamientos">Lineamientos Generales</Label>
                <Textarea
                  id="lineamientos"
                  placeholder="Lineamientos adicionales para los participantes..."
                  rows={4}
                  value={formData.lineamientos}
                  onChange={(e) => setFormData({ ...formData, lineamientos: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
                setSelectedFeria(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={showEditDialog ? handleEditarFeria : handleCrearFeria}>
              {showEditDialog ? "Guardar Cambios" : "Crear Feria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la feria "{selectedFeria?.nombre}" 
              y todos los datos relacionados (inscripciones de vendedores, productos asociados).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarFeria} className="bg-red-600 hover:bg-red-700">
              Eliminar Feria
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo Estadísticas */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Estadísticas - {selectedFeria?.nombre}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendedores Inscritos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feriaStats?.vendedoresInscritos || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendedores Aprobados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feriaStats?.vendedoresAprobados || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feriaStats?.productosTotal || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas Generadas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{feriaStats?.ventasGeneradas || 0}</div>
                </CardContent>
              </Card>
            </div>

            {selectedFeria && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Período:</span>
                    <span>{formatearFecha(selectedFeria.fechaInicio)} - {formatearFecha(selectedFeria.fechaFin)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Estado:</span>
                    {getEstadoBadge(selectedFeria.estado)}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Categorías:</span>
                    <span>{selectedFeria.categorias.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowStatsDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
