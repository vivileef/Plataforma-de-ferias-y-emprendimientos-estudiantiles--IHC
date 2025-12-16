"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { EliminacionVendedor } from "./eliminacion-vendedor"
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
import { useToast } from "@/hooks/use-toast"
import { 
  Shield,
  AlertTriangle,
  Ban,
  Clock,
  CheckCircle,
  History,
  Search,
  User,
  Calendar,
  FileText,
  XCircle,
  Undo2
} from "lucide-react"
import { getAllUsers, AppUser } from "@/components/auth/users"

interface Sancion {
  id: string
  vendedorEmail: string
  vendedorNombre: string
  tipo: "advertencia" | "suspension_temporal" | "prohibicion_permanente"
  motivo: string
  descripcionDetallada: string
  fechaInicio: string
  fechaFin?: string
  duracionDias?: number
  estado: "activa" | "completada" | "revertida"
  adminEmail: string
  fechaCreacion: string
  fechaReversion?: string
  motivoReversion?: string
}

const MOTIVOS_PREDEFINIDOS = [
  "Productos falsificados o no autorizados",
  "Incumplimiento de políticas de envío",
  "Fraude o intento de estafa",
  "Mala atención al cliente",
  "Productos de baja calidad reiterada",
  "Información engañosa en publicaciones",
  "Violación de términos y condiciones",
  "Comportamiento inapropiado o acoso",
  "No responde a reclamos de clientes",
  "Otro (especificar)"
]

export function SancionesVendedor() {
  const { toast } = useToast()
  const [vendedores, setVendedores] = useState<AppUser[]>([])
  const [sanciones, setSanciones] = useState<Sancion[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSancionDialog, setShowSancionDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showRevertDialog, setShowRevertDialog] = useState(false)
  const [selectedVendedor, setSelectedVendedor] = useState<AppUser | null>(null)
  const [selectedSancion, setSelectedSancion] = useState<Sancion | null>(null)
  const [motivoReversion, setMotivoReversion] = useState("")
  
  const [formData, setFormData] = useState({
    tipo: "" as Sancion["tipo"] | "",
    motivoSeleccionado: "",
    descripcionDetallada: "",
    duracionDias: ""
  })

  useEffect(() => {
    loadVendedores()
    loadSanciones()
  }, [])

  const loadVendedores = () => {
    const users = getAllUsers()
    const vendedoresList = users.filter(u => u.role === "vendedor")
    setVendedores(vendedoresList)
  }

  const loadSanciones = () => {
    const sancionesData = localStorage.getItem("marketplace_sanciones")
    if (sancionesData) {
      const sancionesArray: Sancion[] = JSON.parse(sancionesData)
      
      // Actualizar estados automáticamente
      const ahora = new Date()
      const sancionesActualizadas = sancionesArray.map(sancion => {
        if (sancion.estado === "activa" && sancion.fechaFin) {
          const fechaFin = new Date(sancion.fechaFin)
          if (ahora > fechaFin) {
            return { ...sancion, estado: "completada" as const }
          }
        }
        return sancion
      })
      
      setSanciones(sancionesActualizadas)
      localStorage.setItem("marketplace_sanciones", JSON.stringify(sancionesActualizadas))
    }
  }

  const generarIdSancion = () => {
    return `sancion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleAplicarSancion = () => {
    if (!selectedVendedor) return

    // Validaciones
    if (!formData.tipo) {
      toast({
        title: "Error",
        description: "Debes seleccionar el tipo de sanción",
        variant: "destructive"
      })
      return
    }

    if (!formData.motivoSeleccionado) {
      toast({
        title: "Error",
        description: "Debes seleccionar el motivo de la sanción",
        variant: "destructive"
      })
      return
    }

    if (!formData.descripcionDetallada.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar una descripción detallada",
        variant: "destructive"
      })
      return
    }

    if (formData.tipo === "suspension_temporal" && !formData.duracionDias) {
      toast({
        title: "Error",
        description: "Debes especificar la duración de la suspensión",
        variant: "destructive"
      })
      return
    }

    if (formData.tipo === "suspension_temporal") {
      const dias = Number.parseInt(formData.duracionDias, 10)
      if (dias < 1 || dias > 365) {
        toast({
          title: "Error",
          description: "La duración debe estar entre 1 y 365 días",
          variant: "destructive"
        })
        return
      }
    }

    // Verificar si ya tiene una sanción activa
    const sancionActiva = sanciones.find(
      s => s.vendedorEmail === selectedVendedor.email && s.estado === "activa"
    )

    if (sancionActiva && formData.tipo !== "advertencia") {
      toast({
        title: "Sanción existente",
        description: "Este vendedor ya tiene una sanción activa. Debes revertirla primero.",
        variant: "destructive"
      })
      return
    }

    const fechaInicio = new Date().toISOString()
    let fechaFin: string | undefined
    let duracionDias: number | undefined

    if (formData.tipo === "suspension_temporal") {
      duracionDias = Number.parseInt(formData.duracionDias, 10)
      const fechaFinDate = new Date()
      fechaFinDate.setDate(fechaFinDate.getDate() + duracionDias)
      fechaFin = fechaFinDate.toISOString()
    }

    const nuevaSancion: Sancion = {
      id: generarIdSancion(),
      vendedorEmail: selectedVendedor.email,
      vendedorNombre: selectedVendedor.name || selectedVendedor.email,
      tipo: formData.tipo,
      motivo: formData.motivoSeleccionado,
      descripcionDetallada: formData.descripcionDetallada,
      fechaInicio,
      fechaFin,
      duracionDias,
      estado: "activa",
      adminEmail: "admin@gmail.com",
      fechaCreacion: fechaInicio
    }

    const sancionesActualizadas = [...sanciones, nuevaSancion]
    setSanciones(sancionesActualizadas)
    localStorage.setItem("marketplace_sanciones", JSON.stringify(sancionesActualizadas))

    // Si es prohibición permanente o suspensión, bloquear cuenta
    if (formData.tipo !== "advertencia") {
      const usersData = localStorage.getItem("marketplace_users_v1")
      if (usersData) {
        const users: AppUser[] = JSON.parse(usersData)
        const updatedUsers = users.map(u => 
          u.email === selectedVendedor.email 
            ? { ...u, bloqueado: true, motivoBloqueo: formData.motivoSeleccionado }
            : u
        )
        localStorage.setItem("marketplace_users_v1", JSON.stringify(updatedUsers))
      }
    }

    toast({
      title: "Sanción aplicada",
      description: `La sanción ha sido aplicada a ${selectedVendedor.name || selectedVendedor.email}`,
    })

    setShowSancionDialog(false)
    setSelectedVendedor(null)
    resetForm()
    loadVendedores()
  }

  const handleRevertirSancion = () => {
    if (!selectedSancion || !motivoReversion.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar un motivo para revertir la sanción",
        variant: "destructive"
      })
      return
    }

    const sancionesActualizadas = sanciones.map(s =>
      s.id === selectedSancion.id
        ? {
            ...s,
            estado: "revertida" as const,
            fechaReversion: new Date().toISOString(),
            motivoReversion
          }
        : s
    )

    setSanciones(sancionesActualizadas)
    localStorage.setItem("marketplace_sanciones", JSON.stringify(sancionesActualizadas))

    // Desbloquear cuenta
    const usersData = localStorage.getItem("marketplace_users_v1")
    if (usersData) {
      const users: AppUser[] = JSON.parse(usersData)
      const updatedUsers = users.map(u => 
        u.email === selectedSancion.vendedorEmail 
          ? { ...u, bloqueado: false, motivoBloqueo: undefined }
          : u
      )
      localStorage.setItem("marketplace_users_v1", JSON.stringify(updatedUsers))
    }

    toast({
      title: "Sanción revertida",
      description: "La sanción ha sido revertida exitosamente"
    })

    setShowRevertDialog(false)
    setSelectedSancion(null)
    setMotivoReversion("")
    loadVendedores()
  }

  const openSancionDialog = (vendedor: AppUser) => {
    setSelectedVendedor(vendedor)
    setShowSancionDialog(true)
  }

  const openHistoryDialog = (vendedor: AppUser) => {
    setSelectedVendedor(vendedor)
    setShowHistoryDialog(true)
  }

  const openRevertDialog = (sancion: Sancion) => {
    setSelectedSancion(sancion)
    setShowRevertDialog(true)
  }

  const resetForm = () => {
    setFormData({
      tipo: "",
      motivoSeleccionado: "",
      descripcionDetallada: "",
      duracionDias: ""
    })
  }

  const getSancionActiva = (vendedorEmail: string) => {
    return sanciones.find(
      s => s.vendedorEmail === vendedorEmail && s.estado === "activa"
    )
  }

  const getSancionesPorVendedor = (vendedorEmail: string) => {
    return sanciones.filter(s => s.vendedorEmail === vendedorEmail)
  }

  const getTipoBadge = (tipo: Sancion["tipo"]) => {
    const config = {
      advertencia: { label: "Advertencia", color: "bg-yellow-500" },
      suspension_temporal: { label: "Suspensión", color: "bg-orange-500" },
      prohibicion_permanente: { label: "Prohibición", color: "bg-red-600" }
    }
    
    const { label, color } = config[tipo]
    return <Badge className={color}>{label}</Badge>
  }

  const getEstadoBadge = (estado: Sancion["estado"]) => {
    const config = {
      activa: { label: "Activa", color: "bg-red-500" },
      completada: { label: "Completada", color: "bg-gray-500" },
      revertida: { label: "Revertida", color: "bg-green-500" }
    }
    
    const { label, color } = config[estado]
    return <Badge className={color}>{label}</Badge>
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calcularDiasRestantes = (fechaFin: string) => {
    const ahora = new Date()
    const fin = new Date(fechaFin)
    const diff = fin.getTime() - ahora.getTime()
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return dias > 0 ? dias : 0
  }

  // Filtrar vendedores
  const filteredVendedores = vendedores.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Estadísticas
  const stats = {
    totalVendedores: vendedores.length,
    vendedoresSancionados: new Set(sanciones.filter(s => s.estado === "activa").map(s => s.vendedorEmail)).size,
    sancionesActivas: sanciones.filter(s => s.estado === "activa").length,
    suspensionesTemporales: sanciones.filter(s => s.tipo === "suspension_temporal" && s.estado === "activa").length,
    prohibicionesPermanentes: sanciones.filter(s => s.tipo === "prohibicion_permanente" && s.estado === "activa").length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Sanciones</h2>
        <p className="text-muted-foreground">
          Administra sanciones, suspensiones y prohibiciones de vendedores
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendedores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendedores}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sancionados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vendedoresSancionados}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sanciones Activas</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sancionesActivas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspensiones</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspensionesTemporales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prohibiciones</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prohibicionesPermanentes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendedor por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="vendedores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendedores">
            Todos los Vendedores ({vendedores.length})
          </TabsTrigger>
          <TabsTrigger value="sancionados">
            Sancionados ({stats.vendedoresSancionados})
          </TabsTrigger>
          <TabsTrigger value="eliminaciones">
            Eliminaciones
          </TabsTrigger>
          <TabsTrigger value="historial">
            Historial Completo ({sanciones.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab de Eliminaciones */}
        <TabsContent value="eliminaciones">
          <EliminacionVendedor />
        </TabsContent>

        {/* Todos los vendedores */}
        <TabsContent value="vendedores" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendedores.map((vendedor) => {
              const sancionActiva = getSancionActiva(vendedor.email)
              const historial = getSancionesPorVendedor(vendedor.email)
              const estaEliminado = vendedor.eliminado
              
              return (
                <Card key={vendedor.email} className={sancionActiva ? "border-red-500" : estaEliminado ? "border-gray-500 opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{vendedor.name || "Sin nombre"}</CardTitle>
                        <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                        {estaEliminado && (
                          <Badge variant="outline" className="bg-gray-100">
                            Cuenta Eliminada
                          </Badge>
                        )}
                      </div>
                      {sancionActiva && !estaEliminado && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {estaEliminado && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">
                          Este vendedor ha sido eliminado del sistema. Ya no puede acceder ni operar.
                        </p>
                      </div>
                    )}

                    {sancionActiva && !estaEliminado && (
                      <div className="space-y-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          {getTipoBadge(sancionActiva.tipo)}
                          {getEstadoBadge(sancionActiva.estado)}
                        </div>
                        <p className="text-sm font-medium text-red-900">
                          {sancionActiva.motivo}
                        </p>
                        {sancionActiva.fechaFin && (
                          <p className="text-xs text-red-700">
                            {calcularDiasRestantes(sancionActiva.fechaFin)} días restantes
                          </p>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      <History className="h-4 w-4 inline mr-1" />
                      {historial.length} sanciones en historial
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openHistoryDialog(vendedor)}
                      >
                        <History className="mr-2 h-4 w-4" />
                        Historial
                      </Button>
                      
                      {sancionActiva && !estaEliminado ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openRevertDialog(sancionActiva)}
                        >
                          <Undo2 className="mr-2 h-4 w-4" />
                          Revertir
                        </Button>
                      ) : !estaEliminado ? (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => openSancionDialog(vendedor)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Sancionar
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredVendedores.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium">No se encontraron vendedores</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vendedores sancionados */}
        <TabsContent value="sancionados">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendedores
              .filter(v => getSancionActiva(v.email))
              .map((vendedor) => {
                const sancionActiva = getSancionActiva(vendedor.email)!
                
                return (
                  <Card key={vendedor.email} className="border-red-500">
                    <CardHeader>
                      <CardTitle className="text-lg">{vendedor.name || "Sin nombre"}</CardTitle>
                      <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          {getTipoBadge(sancionActiva.tipo)}
                          {getEstadoBadge(sancionActiva.estado)}
                        </div>
                        <p className="text-sm font-medium">{sancionActiva.motivo}</p>
                        <p className="text-xs text-muted-foreground">
                          Desde: {formatearFecha(sancionActiva.fechaInicio)}
                        </p>
                        {sancionActiva.fechaFin && (
                          <p className="text-xs font-medium text-red-700">
                            Quedan {calcularDiasRestantes(sancionActiva.fechaFin)} días
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openRevertDialog(sancionActiva)}
                      >
                        <Undo2 className="mr-2 h-4 w-4" />
                        Revertir Sanción
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        {/* Historial completo */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial Completo de Sanciones</CardTitle>
              <CardDescription>Todas las sanciones aplicadas en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sanciones.slice().reverse().map((sancion) => (
                  <div key={sancion.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {sancion.tipo === "advertencia" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {sancion.tipo === "suspension_temporal" && <Clock className="h-5 w-5 text-orange-500" />}
                      {sancion.tipo === "prohibicion_permanente" && <Ban className="h-5 w-5 text-red-600" />}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{sancion.vendedorNombre}</p>
                          <p className="text-sm text-muted-foreground">{sancion.vendedorEmail}</p>
                        </div>
                        <div className="flex gap-2">
                          {getTipoBadge(sancion.tipo)}
                          {getEstadoBadge(sancion.estado)}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium">{sancion.motivo}</p>
                        <p className="text-muted-foreground">{sancion.descripcionDetallada}</p>
                      </div>
                      
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatearFecha(sancion.fechaInicio)}
                        </span>
                        {sancion.fechaFin && (
                          <span>
                            Hasta: {formatearFecha(sancion.fechaFin)}
                          </span>
                        )}
                        {sancion.duracionDias && (
                          <span>Duración: {sancion.duracionDias} días</span>
                        )}
                      </div>

                      {sancion.estado === "revertida" && sancion.fechaReversion && (
                        <div className="p-2 bg-green-50 rounded text-sm">
                          <p className="font-medium text-green-900">Revertida</p>
                          <p className="text-green-700">{sancion.motivoReversion}</p>
                          <p className="text-xs text-green-600">
                            {formatearFecha(sancion.fechaReversion)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {sanciones.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay sanciones registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo Aplicar Sanción */}
      <Dialog open={showSancionDialog} onOpenChange={setShowSancionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aplicar Sanción a {selectedVendedor?.name || selectedVendedor?.email}</DialogTitle>
            <DialogDescription>
              Completa todos los campos requeridos. Esta acción quedará registrada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tipo de sanción */}
            <div className="space-y-2">
              <Label>Tipo de Sanción *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value as Sancion["tipo"] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de sanción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advertencia">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Advertencia (sin bloqueo)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="suspension_temporal">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Suspensión Temporal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="prohibicion_permanente">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-red-600" />
                      <span>Prohibición Permanente</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duración (solo para suspensión temporal) */}
            {formData.tipo === "suspension_temporal" && (
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración en Días *</Label>
                <Input
                  id="duracion"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="Ej: 7, 30, 90"
                  value={formData.duracionDias}
                  onChange={(e) => setFormData({ ...formData, duracionDias: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 1 día, máximo 365 días
                </p>
              </div>
            )}

            {/* Motivo predefinido */}
            <div className="space-y-2">
              <Label>Motivo de la Sanción *</Label>
              <Select value={formData.motivoSeleccionado} onValueChange={(value) => setFormData({ ...formData, motivoSeleccionado: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el motivo" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_PREDEFINIDOS.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción detallada */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Detallada *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe los detalles específicos del incidente, evidencias, y razones para aplicar esta sanción..."
                rows={5}
                value={formData.descripcionDetallada}
                onChange={(e) => setFormData({ ...formData, descripcionDetallada: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Esta información será parte del registro oficial
              </p>
            </div>

            {/* Advertencia */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 mb-1">Importante</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  <li>Verifica que toda la información sea correcta</li>
                  <li>Las suspensiones y prohibiciones bloquearán la cuenta</li>
                  <li>Esta acción quedará registrada permanentemente</li>
                  <li>Puedes revertir la sanción más adelante si es necesario</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSancionDialog(false)
                setSelectedVendedor(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAplicarSancion} className="bg-red-600 hover:bg-red-700">
              <Shield className="mr-2 h-4 w-4" />
              Aplicar Sanción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Historial */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de Sanciones - {selectedVendedor?.name || selectedVendedor?.email}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedVendedor && getSancionesPorVendedor(selectedVendedor.email).length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-lg font-medium">Sin sanciones</p>
                <p className="text-sm text-muted-foreground">
                  Este vendedor no tiene sanciones registradas
                </p>
              </div>
            ) : (
              selectedVendedor && getSancionesPorVendedor(selectedVendedor.email).map((sancion) => (
                <div key={sancion.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      {getTipoBadge(sancion.tipo)}
                      {getEstadoBadge(sancion.estado)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatearFecha(sancion.fechaInicio)}
                    </span>
                  </div>
                  
                  <div>
                    <p className="font-medium">{sancion.motivo}</p>
                    <p className="text-sm text-muted-foreground">{sancion.descripcionDetallada}</p>
                  </div>

                  {sancion.duracionDias && (
                    <p className="text-sm">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Duración: {sancion.duracionDias} días
                    </p>
                  )}

                  {sancion.estado === "activa" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowHistoryDialog(false)
                        openRevertDialog(sancion)
                      }}
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      Revertir
                    </Button>
                  )}

                  {sancion.estado === "revertida" && (
                    <div className="p-2 bg-green-50 rounded text-sm">
                      <p className="font-medium text-green-900">Revertida</p>
                      <p className="text-green-700">{sancion.motivoReversion}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowHistoryDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Revertir Sanción */}
      <AlertDialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revertir Sanción</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de revertir la sanción aplicada a {selectedSancion?.vendedorNombre}.
              La cuenta será desbloqueada inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="motivoReversion">Motivo de la Reversión *</Label>
            <Textarea
              id="motivoReversion"
              placeholder="Explica por qué se revierte esta sanción..."
              rows={3}
              value={motivoReversion}
              onChange={(e) => setMotivoReversion(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRevertDialog(false)
              setSelectedSancion(null)
              setMotivoReversion("")
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRevertirSancion}>
              Revertir Sanción
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
