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
import { useToast } from "@/hooks/use-toast"
import { 
  UserX,
  Trash2,
  AlertTriangle,
  Search,
  User,
  Calendar,
  FileText,
  History,
  CheckCircle,
  XCircle,
  Undo2,
  ShieldAlert,
  Link as LinkIcon
} from "lucide-react"
import { getAllUsers, AppUser } from "@/components/auth/users"

interface EliminacionVendedor {
  id: string
  vendedorEmail: string
  vendedorNombre: string
  motivoSeleccionado: string
  descripcionDetallada: string
  evidencias: string
  enlaceReclamos: string
  fechaEliminacion: string
  adminEmail: string
  adminNombre: string
  estado: "eliminado" | "reactivado"
  fechaReactivacion?: string
  motivoReactivacion?: string
}

const MOTIVOS_ELIMINACION = [
  "Fraude confirmado o estafa comprobada",
  "Productos ilegales o prohibidos",
  "Incumplimiento grave y reiterado de políticas",
  "Violación de derechos de autor o propiedad intelectual",
  "Comportamiento abusivo o amenazante",
  "Múltiples reclamos sin resolución",
  "Inactividad prolongada (abandono de cuenta)",
  "Solicitud del propio vendedor",
  "Suplantación de identidad",
  "Competencia desleal o manipulación de sistema",
  "Incumplimiento de normas legales o regulatorias",
  "Otro motivo (especificar detalladamente)"
]

export function EliminacionVendedor() {
  const { toast } = useToast()
  const [vendedores, setVendedores] = useState<AppUser[]>([])
  const [eliminaciones, setEliminaciones] = useState<EliminacionVendedor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showEliminarDialog, setShowEliminarDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showReactivarDialog, setShowReactivarDialog] = useState(false)
  const [selectedVendedor, setSelectedVendedor] = useState<AppUser | null>(null)
  const [motivoReactivacion, setMotivoReactivacion] = useState("")
  
  const [formData, setFormData] = useState({
    motivoSeleccionado: "",
    descripcionDetallada: "",
    evidencias: "",
    enlaceReclamos: ""
  })

  useEffect(() => {
    loadVendedores()
    loadEliminaciones()
  }, [])

  const loadVendedores = () => {
    const users = getAllUsers()
    const vendedoresList = users.filter(u => u.role === "vendedor")
    setVendedores(vendedoresList)
  }

  const loadEliminaciones = () => {
    const eliminacionesData = localStorage.getItem("marketplace_eliminaciones_vendedores")
    if (eliminacionesData) {
      setEliminaciones(JSON.parse(eliminacionesData))
    }
  }

  const generarIdEliminacion = () => {
    return `eliminacion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const isVendedorEliminado = (email: string) => {
    return eliminaciones.some(e => e.vendedorEmail === email && e.estado === "eliminado")
  }

  const getEliminacion = (email: string) => {
    return eliminaciones.find(e => e.vendedorEmail === email && e.estado === "eliminado")
  }

  const handleEliminarVendedor = () => {
    if (!selectedVendedor) return

    // Validaciones
    if (!formData.motivoSeleccionado) {
      toast({
        title: "Error",
        description: "Debes seleccionar el motivo de eliminación",
        variant: "destructive"
      })
      return
    }

    if (!formData.descripcionDetallada.trim() || formData.descripcionDetallada.length < 50) {
      toast({
        title: "Error",
        description: "La descripción debe tener al menos 50 caracteres",
        variant: "destructive"
      })
      return
    }

    // Verificar si ya está eliminado
    if (isVendedorEliminado(selectedVendedor.email)) {
      toast({
        title: "Error",
        description: "Este vendedor ya ha sido eliminado",
        variant: "destructive"
      })
      return
    }

    const nuevaEliminacion: EliminacionVendedor = {
      id: generarIdEliminacion(),
      vendedorEmail: selectedVendedor.email,
      vendedorNombre: selectedVendedor.name || selectedVendedor.email,
      motivoSeleccionado: formData.motivoSeleccionado,
      descripcionDetallada: formData.descripcionDetallada,
      evidencias: formData.evidencias,
      enlaceReclamos: formData.enlaceReclamos,
      fechaEliminacion: new Date().toISOString(),
      adminEmail: "admin@gmail.com",
      adminNombre: "Administrador",
      estado: "eliminado"
    }

    // Guardar eliminación
    const eliminacionesActualizadas = [...eliminaciones, nuevaEliminacion]
    setEliminaciones(eliminacionesActualizadas)
    localStorage.setItem("marketplace_eliminaciones_vendedores", JSON.stringify(eliminacionesActualizadas))

    // Marcar usuario como bloqueado y eliminado
    const usersData = localStorage.getItem("marketplace_users_v1")
    if (usersData) {
      const users: AppUser[] = JSON.parse(usersData)
      const updatedUsers = users.map(u => 
        u.email === selectedVendedor.email 
          ? { ...u, bloqueado: true, motivoBloqueo: "Cuenta eliminada: " + formData.motivoSeleccionado, eliminado: true }
          : u
      )
      localStorage.setItem("marketplace_users_v1", JSON.stringify(updatedUsers))
    }

    // Bloquear productos del vendedor
    const productsData = localStorage.getItem("marketplace_products")
    if (productsData) {
      const products = JSON.parse(productsData)
      const statusData = localStorage.getItem("marketplace_products_status") || "{}"
      const statusMap: Record<string, any[]> = JSON.parse(statusData)

      products.forEach((product: any) => {
        if (product.seller === selectedVendedor.email || product.vendedor === selectedVendedor.email) {
          if (!statusMap[product.id]) {
            statusMap[product.id] = []
          }
          statusMap[product.id].push({
            estado: "eliminado",
            razon: `Vendedor eliminado: ${formData.motivoSeleccionado}`,
            fecha: new Date().toISOString(),
            adminEmail: "admin@gmail.com"
          })
        }
      })

      localStorage.setItem("marketplace_products_status", JSON.stringify(statusMap))
    }

    toast({
      title: "Vendedor eliminado",
      description: `${selectedVendedor.name || selectedVendedor.email} ha sido eliminado del sistema`,
    })

    setShowConfirmDialog(false)
    setShowEliminarDialog(false)
    setSelectedVendedor(null)
    resetForm()
    loadVendedores()
  }

  const handleReactivarVendedor = () => {
    const eliminacion = getEliminacion(selectedVendedor!.email)
    if (!eliminacion || !motivoReactivacion.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar un motivo para reactivar la cuenta",
        variant: "destructive"
      })
      return
    }

    // Actualizar eliminación
    const eliminacionesActualizadas = eliminaciones.map(e =>
      e.id === eliminacion.id
        ? {
            ...e,
            estado: "reactivado" as const,
            fechaReactivacion: new Date().toISOString(),
            motivoReactivacion
          }
        : e
    )

    setEliminaciones(eliminacionesActualizadas)
    localStorage.setItem("marketplace_eliminaciones_vendedores", JSON.stringify(eliminacionesActualizadas))

    // Desbloquear usuario
    const usersData = localStorage.getItem("marketplace_users_v1")
    if (usersData) {
      const users: AppUser[] = JSON.parse(usersData)
      const updatedUsers = users.map(u => 
        u.email === selectedVendedor!.email 
          ? { ...u, bloqueado: false, motivoBloqueo: undefined, eliminado: undefined }
          : u
      )
      localStorage.setItem("marketplace_users_v1", JSON.stringify(updatedUsers))
    }

    toast({
      title: "Cuenta reactivada",
      description: "El vendedor ha sido reactivado exitosamente"
    })

    setShowReactivarDialog(false)
    setSelectedVendedor(null)
    setMotivoReactivacion("")
    loadVendedores()
  }

  const openEliminarDialog = (vendedor: AppUser) => {
    setSelectedVendedor(vendedor)
    setShowEliminarDialog(true)
  }

  const openHistoryDialog = (vendedor: AppUser) => {
    setSelectedVendedor(vendedor)
    setShowHistoryDialog(true)
  }

  const openReactivarDialog = (vendedor: AppUser) => {
    setSelectedVendedor(vendedor)
    setShowReactivarDialog(true)
  }

  const resetForm = () => {
    setFormData({
      motivoSeleccionado: "",
      descripcionDetallada: "",
      evidencias: "",
      enlaceReclamos: ""
    })
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

  // Filtrar vendedores
  const filteredVendedores = vendedores.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const vendedoresActivos = filteredVendedores.filter(v => !isVendedorEliminado(v.email))
  const vendedoresEliminados = filteredVendedores.filter(v => isVendedorEliminado(v.email))

  // Estadísticas
  const stats = {
    totalVendedores: vendedores.length,
    vendedoresActivos: vendedores.filter(v => !isVendedorEliminado(v.email)).length,
    vendedoresEliminados: eliminaciones.filter(e => e.estado === "eliminado").length,
    vendedoresReactivados: eliminaciones.filter(e => e.estado === "reactivado").length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Eliminación de Vendedores</h2>
        <p className="text-muted-foreground">
          Gestiona la eliminación permanente de cuentas de vendedores
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vendedoresActivos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eliminados</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vendedoresEliminados}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reactivados</CardTitle>
            <Undo2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vendedoresReactivados}</div>
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
      <Tabs defaultValue="activos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activos">
            Vendedores Activos ({vendedoresActivos.length})
          </TabsTrigger>
          <TabsTrigger value="eliminados">
            Eliminados ({vendedoresEliminados.length})
          </TabsTrigger>
          <TabsTrigger value="historial">
            Historial Completo ({eliminaciones.length})
          </TabsTrigger>
        </TabsList>

        {/* Vendedores activos */}
        <TabsContent value="activos" className="space-y-4">
          {vendedoresActivos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium">No se encontraron vendedores activos</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vendedoresActivos.map((vendedor) => (
                <Card key={vendedor.email}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{vendedor.name || "Sin nombre"}</CardTitle>
                        <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                      </div>
                      <Badge className="bg-green-500">Activo</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {vendedor.phone && (
                      <p className="text-sm text-muted-foreground">
                        📞 {vendedor.phone}
                      </p>
                    )}

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
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEliminarDialog(vendedor)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Vendedores eliminados */}
        <TabsContent value="eliminados" className="space-y-4">
          {vendedoresEliminados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">No hay vendedores eliminados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vendedoresEliminados.map((vendedor) => {
                const eliminacion = getEliminacion(vendedor.email)!
                
                return (
                  <Card key={vendedor.email} className="border-red-500 opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{vendedor.name || "Sin nombre"}</CardTitle>
                          <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                        </div>
                        <Badge className="bg-red-500">Eliminado</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-900">
                          {eliminacion.motivoSeleccionado}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          {formatearFecha(eliminacion.fechaEliminacion)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openHistoryDialog(vendedor)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Detalles
                        </Button>
                        
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => openReactivarDialog(vendedor)}
                        >
                          <Undo2 className="mr-2 h-4 w-4" />
                          Reactivar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Historial completo */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Eliminaciones</CardTitle>
              <CardDescription>Registro completo de todas las eliminaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eliminaciones.slice().reverse().map((eliminacion) => (
                  <div key={eliminacion.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg">{eliminacion.vendedorNombre}</p>
                        <p className="text-sm text-muted-foreground">{eliminacion.vendedorEmail}</p>
                      </div>
                      <Badge className={eliminacion.estado === "eliminado" ? "bg-red-500" : "bg-green-500"}>
                        {eliminacion.estado === "eliminado" ? "Eliminado" : "Reactivado"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Motivo:</p>
                        <p className="text-sm">{eliminacion.motivoSeleccionado}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Descripción:</p>
                        <p className="text-sm">{eliminacion.descripcionDetallada}</p>
                      </div>

                      {eliminacion.evidencias && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Evidencias:</p>
                          <p className="text-sm">{eliminacion.evidencias}</p>
                        </div>
                      )}

                      {eliminacion.enlaceReclamos && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Enlaces a reclamos:</p>
                          <p className="text-sm text-blue-600">{eliminacion.enlaceReclamos}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <span>
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Eliminado: {formatearFecha(eliminacion.fechaEliminacion)}
                      </span>
                      <span>Por: {eliminacion.adminNombre}</span>
                    </div>

                    {eliminacion.estado === "reactivado" && eliminacion.fechaReactivacion && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900">Reactivado</p>
                        <p className="text-sm text-green-700">{eliminacion.motivoReactivacion}</p>
                        <p className="text-xs text-green-600 mt-1">
                          {formatearFecha(eliminacion.fechaReactivacion)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {eliminaciones.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay eliminaciones registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo Eliminar Vendedor */}
      <Dialog open={showEliminarDialog} onOpenChange={setShowEliminarDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              Eliminar Vendedor: {selectedVendedor?.name || selectedVendedor?.email}
            </DialogTitle>
            <DialogDescription>
              Esta acción desactivará permanentemente la cuenta. Todos los productos serán ocultados.
              El historial se mantendrá para auditorías.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Motivo */}
            <div className="space-y-2">
              <Label>Motivo de Eliminación *</Label>
              <Select value={formData.motivoSeleccionado} onValueChange={(value) => setFormData({ ...formData, motivoSeleccionado: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el motivo" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_ELIMINACION.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción detallada */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Detallada * (mínimo 50 caracteres)</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe detalladamente las razones, incidentes, fechas, y cualquier información relevante que justifique esta eliminación..."
                rows={5}
                value={formData.descripcionDetallada}
                onChange={(e) => setFormData({ ...formData, descripcionDetallada: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {formData.descripcionDetallada.length} caracteres
              </p>
            </div>

            {/* Evidencias */}
            <div className="space-y-2">
              <Label htmlFor="evidencias">Evidencias (opcional)</Label>
              <Textarea
                id="evidencias"
                placeholder="IDs de transacciones, capturas de pantalla, reportes, testimonios de clientes, etc."
                rows={3}
                value={formData.evidencias}
                onChange={(e) => setFormData({ ...formData, evidencias: e.target.value })}
              />
            </div>

            {/* Enlaces a reclamos */}
            <div className="space-y-2">
              <Label htmlFor="enlaces">Enlaces a Reclamos o Documentos (opcional)</Label>
              <Input
                id="enlaces"
                type="text"
                placeholder="IDs de reclamos relacionados, URLs de documentos, etc."
                value={formData.enlaceReclamos}
                onChange={(e) => setFormData({ ...formData, enlaceReclamos: e.target.value })}
              />
            </div>

            {/* Advertencias */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-900 mb-2">Consecuencias de la eliminación:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    <li>El vendedor no podrá acceder a su cuenta</li>
                    <li>Todos sus productos serán ocultados del catálogo</li>
                    <li>Se eliminará de las ferias activas</li>
                    <li>Los datos históricos se mantendrán para auditorías</li>
                    <li>Pedidos pasados y reseñas permanecerán visibles</li>
                    <li>Esta acción es reversible con autorización</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <FileText className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 mb-1">Documentación legal:</p>
                  <p className="text-yellow-700">
                    Este registro será parte de la documentación oficial y podrá ser requerido en auditorías o procesos legales. Asegúrate de que toda la información sea precisa y verificable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEliminarDialog(false)
                setSelectedVendedor(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                setShowEliminarDialog(false)
                setShowConfirmDialog(true)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              ¿Confirmar eliminación?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar permanentemente la cuenta de{" "}
              <span className="font-semibold">{selectedVendedor?.name || selectedVendedor?.email}</span>.
              <br /><br />
              Esta acción bloqueará el acceso y ocultará todos los productos.
              ¿Estás completamente seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false)
              setShowEliminarDialog(true)
            }}>
              Volver atrás
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEliminarVendedor}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar vendedor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo Historial */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial - {selectedVendedor?.name || selectedVendedor?.email}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedVendedor && eliminaciones.filter(e => e.vendedorEmail === selectedVendedor.email).length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-lg font-medium">Sin registros de eliminación</p>
                <p className="text-sm text-muted-foreground">
                  Este vendedor no ha sido eliminado
                </p>
              </div>
            ) : (
              selectedVendedor && eliminaciones
                .filter(e => e.vendedorEmail === selectedVendedor.email)
                .map((eliminacion) => (
                  <div key={eliminacion.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={eliminacion.estado === "eliminado" ? "bg-red-500" : "bg-green-500"}>
                        {eliminacion.estado === "eliminado" ? "Eliminado" : "Reactivado"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatearFecha(eliminacion.fechaEliminacion)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Motivo:</p>
                        <p className="text-sm text-muted-foreground">{eliminacion.motivoSeleccionado}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Descripción:</p>
                        <p className="text-sm text-muted-foreground">{eliminacion.descripcionDetallada}</p>
                      </div>
                    </div>

                    {eliminacion.estado === "reactivado" && (
                      <div className="p-2 bg-green-50 rounded text-sm">
                        <p className="font-medium text-green-900">Reactivado</p>
                        <p className="text-green-700">{eliminacion.motivoReactivacion}</p>
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

      {/* Diálogo Reactivar */}
      <AlertDialog open={showReactivarDialog} onOpenChange={setShowReactivarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivar Cuenta</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a reactivar la cuenta de {selectedVendedor?.name || selectedVendedor?.email}.
              El vendedor recuperará acceso completo a la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="motivoReact">Motivo de la Reactivación *</Label>
            <Textarea
              id="motivoReact"
              placeholder="Explica por qué se reactiva esta cuenta..."
              rows={3}
              value={motivoReactivacion}
              onChange={(e) => setMotivoReactivacion(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowReactivarDialog(false)
              setSelectedVendedor(null)
              setMotivoReactivacion("")
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivarVendedor}>
              Reactivar Cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
