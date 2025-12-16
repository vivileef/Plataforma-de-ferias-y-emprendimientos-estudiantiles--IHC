"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Package, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  XCircle,
  Edit
} from "lucide-react"
import { getSession } from "@/components/auth/users"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface Reclamo {
  ticketNumber: string
  numeroPedido: string
  tipoReclamo: string
  producto: string
  vendedorEmail: string
  descripcion: string
  email: string
  telefono: string
  estado: "pendiente" | "en-proceso" | "resuelto" | "rechazado"
  fechaCreacion: string
  compradorEmail: string
}

interface Solicitud {
  ticketNumber: string
  numeroPedido: string
  tipoSolicitud: "cancelacion" | "modificacion"
  vendedorEmail: string
  motivoCancelacion?: string
  tipoModificacion?: string
  detallesModificacion?: string
  nuevaDireccion?: string
  nuevoTelefono?: string
  metodoReembolso?: string
  cuentaReembolso?: string
  comentariosAdicionales: string
  email: string
  telefono: string
  estado: "pendiente" | "aprobado" | "rechazado" | "procesado"
  fechaCreacion: string
  compradorEmail: string
}

export function ReclamosVendedor() {
  const [reclamos, setReclamos] = useState<Reclamo[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [selectedReclamo, setSelectedReclamo] = useState<Reclamo | null>(null)
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showSolicitudDialog, setShowSolicitudDialog] = useState(false)
  const [filter, setFilter] = useState<"todos" | "pendiente" | "en-proceso" | "resuelto">("todos")
  const [solicitudFilter, setsolicitudFilter] = useState<"todos" | "pendiente" | "aprobado" | "procesado">("todos")
  const [activeTab, setActiveTab] = useState<"reclamos" | "solicitudes">("reclamos")
  const { toast } = useToast()

  useEffect(() => {
    loadReclamos()
    loadSolicitudes()
  }, [])

  const loadReclamos = () => {
    try {
      const session = getSession()
      if (!session?.email) return

      const allReclamos = JSON.parse(localStorage.getItem("marketplace_reclamos") || "[]")
      // Filtrar solo los reclamos dirigidos a este vendedor
      const misReclamos = allReclamos.filter((r: Reclamo) => r.vendedorEmail === session.email)
      setReclamos(misReclamos)
    } catch (error) {
      console.error("Error al cargar reclamos:", error)
    }
  }

  const loadSolicitudes = () => {
    try {
      const session = getSession()
      if (!session?.email) return

      const allSolicitudes = JSON.parse(localStorage.getItem("marketplace_solicitudes") || "[]")
      const misSolicitudes = allSolicitudes.filter((s: Solicitud) => s.vendedorEmail === session.email)
      setSolicitudes(misSolicitudes)
    } catch (error) {
      console.error("Error al cargar solicitudes:", error)
    }
  }

  const handleEstadoChange = (ticketNumber: string, nuevoEstado: Reclamo["estado"]) => {
    try {
      const allReclamos = JSON.parse(localStorage.getItem("marketplace_reclamos") || "[]")
      const updatedReclamos = allReclamos.map((r: Reclamo) =>
        r.ticketNumber === ticketNumber ? { ...r, estado: nuevoEstado } : r
      )
      localStorage.setItem("marketplace_reclamos", JSON.stringify(updatedReclamos))
      loadReclamos()
      
      toast({
        title: "Estado actualizado",
        description: `El reclamo ${ticketNumber} ahora está en estado: ${nuevoEstado}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del reclamo",
        variant: "destructive",
      })
    }
  }

  const handleSolicitudEstadoChange = (ticketNumber: string, nuevoEstado: Solicitud["estado"]) => {
    try {
      const allSolicitudes = JSON.parse(localStorage.getItem("marketplace_solicitudes") || "[]")
      const updatedSolicitudes = allSolicitudes.map((s: Solicitud) =>
        s.ticketNumber === ticketNumber ? { ...s, estado: nuevoEstado } : s
      )
      localStorage.setItem("marketplace_solicitudes", JSON.stringify(updatedSolicitudes))
      loadSolicitudes()
      
      toast({
        title: "Estado actualizado",
        description: `La solicitud ${ticketNumber} ahora está en estado: ${nuevoEstado}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la solicitud",
        variant: "destructive",
      })
    }
  }

  const getSolicitudBadge = (estado: Solicitud["estado"]) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>
      case "aprobado":
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Aprobado</Badge>
      case "rechazado":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rechazado</Badge>
      case "procesado":
        return <Badge variant="default" className="gap-1 bg-blue-500"><CheckCircle className="h-3 w-3" />Procesado</Badge>
      default:
        return null
    }
  }

  const getEstadoBadge = (estado: Reclamo["estado"]) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>
      case "en-proceso":
        return <Badge variant="default" className="gap-1 bg-blue-500"><AlertCircle className="h-3 w-3" />En Proceso</Badge>
      case "resuelto":
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Resuelto</Badge>
      case "rechazado":
        return <Badge variant="destructive" className="gap-1">Rechazado</Badge>
      default:
        return null
    }
  }

  const getTipoReclamoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      "producto-defectuoso": "Producto Defectuoso",
      "producto-incorrecto": "Producto Incorrecto",
      "producto-danado": "Producto Dañado",
      "producto-faltante": "Producto Faltante",
      "descripcion-incorrecta": "Descripción Incorrecta",
      "calidad-insatisfactoria": "Calidad Insatisfactoria",
      "retraso-entrega": "Retraso en Entrega",
      "otro": "Otro Motivo",
    }
    return tipos[tipo] || tipo
  }

  const filteredReclamos = reclamos.filter(r => 
    filter === "todos" || r.estado === filter
  )

  const filteredSolicitudes = solicitudes.filter(s =>
    solicitudFilter === "todos" || s.estado === solicitudFilter
  )

  const reclamosPendientes = reclamos.filter(r => r.estado === "pendiente").length
  const reclamosEnProceso = reclamos.filter(r => r.estado === "en-proceso").length
  const reclamosResueltos = reclamos.filter(r => r.estado === "resuelto").length

  const solicitudesPendientes = solicitudes.filter(s => s.estado === "pendiente").length
  const solicitudesAprobadas = solicitudes.filter(s => s.estado === "aprobado").length
  const solicitudesProcesadas = solicitudes.filter(s => s.estado === "procesado").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reclamos y Solicitudes</h2>
        <p className="text-muted-foreground mt-1">
          Gestiona reclamos de clientes y solicitudes de cancelación/modificación
        </p>
      </div>

      {/* Tabs Principal */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reclamos" className="relative">
            Reclamos
            {reclamosPendientes > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold">
                {reclamosPendientes}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="relative">
            Cancelaciones/Modificaciones
            {solicitudesPendientes > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-semibold">
                {solicitudesPendientes}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Contenido de Reclamos */}
        <TabsContent value="reclamos" className="space-y-6">
          {/* Estadísticas de Reclamos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Reclamos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reclamos.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{reclamosPendientes}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En Proceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{reclamosEnProceso}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resueltos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{reclamosResueltos}</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Reclamos */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Mis Reclamos Recibidos
          </CardTitle>
          <CardDescription>
            Gestiona los reclamos y devoluciones de tus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos ({reclamos.length})</TabsTrigger>
              <TabsTrigger value="pendiente">Pendientes ({reclamosPendientes})</TabsTrigger>
              <TabsTrigger value="en-proceso">En Proceso ({reclamosEnProceso})</TabsTrigger>
              <TabsTrigger value="resuelto">Resueltos ({reclamosResueltos})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              {filteredReclamos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay reclamos en esta categoría</p>
                </div>
              ) : (
                filteredReclamos.map((reclamo) => (
                  <Card key={reclamo.ticketNumber} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono font-semibold text-sm">
                              {reclamo.ticketNumber}
                            </span>
                            {getEstadoBadge(reclamo.estado)}
                            <Badge variant="outline" className="gap-1">
                              <Package className="h-3 w-3" />
                              {reclamo.numeroPedido}
                            </Badge>
                          </div>
                          
                          <div>
                            <p className="font-medium">{getTipoReclamoLabel(reclamo.tipoReclamo)}</p>
                            {reclamo.producto && (
                              <p className="text-sm text-muted-foreground">
                                Producto: {reclamo.producto}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {reclamo.compradorEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(reclamo.fechaCreacion).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReclamo(reclamo)
                              setShowDetailDialog(true)
                            }}
                          >
                            Ver Detalles
                          </Button>
                          
                          {reclamo.estado === "pendiente" && (
                            <Button
                              size="sm"
                              onClick={() => handleEstadoChange(reclamo.ticketNumber, "en-proceso")}
                            >
                              Atender
                            </Button>
                          )}
                          
                          {reclamo.estado === "en-proceso" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleEstadoChange(reclamo.ticketNumber, "resuelto")}
                            >
                              Marcar Resuelto
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

        </TabsContent>

        {/* Contenido de Solicitudes */}
        <TabsContent value="solicitudes" className="space-y-6">
          {/* Estadísticas de Solicitudes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{solicitudes.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{solicitudesPendientes}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aprobadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{solicitudesAprobadas}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Procesadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{solicitudesProcesadas}</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Solicitudes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Solicitudes de Cancelación/Modificación
              </CardTitle>
              <CardDescription>
                Gestiona las solicitudes de cambio y cancelación de pedidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={solicitudFilter} onValueChange={(v) => setsolicitudFilter(v as any)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="todos">Todos ({solicitudes.length})</TabsTrigger>
                  <TabsTrigger value="pendiente">Pendientes ({solicitudesPendientes})</TabsTrigger>
                  <TabsTrigger value="aprobado">Aprobadas ({solicitudesAprobadas})</TabsTrigger>
                  <TabsTrigger value="procesado">Procesadas ({solicitudesProcesadas})</TabsTrigger>
                </TabsList>

                <TabsContent value={solicitudFilter} className="space-y-4">
                  {filteredSolicitudes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay solicitudes en esta categoría</p>
                    </div>
                  ) : (
                    filteredSolicitudes.map((solicitud) => (
                      <Card key={solicitud.ticketNumber} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono font-semibold text-sm">
                                  {solicitud.ticketNumber}
                                </span>
                                {getSolicitudBadge(solicitud.estado)}
                                <Badge variant="outline" className="gap-1">
                                  <Package className="h-3 w-3" />
                                  {solicitud.numeroPedido}
                                </Badge>
                                <Badge className={solicitud.tipoSolicitud === "cancelacion" ? "bg-red-500" : "bg-blue-500"}>
                                  {solicitud.tipoSolicitud === "cancelacion" ? (
                                    <><XCircle className="h-3 w-3 mr-1" />Cancelación</>
                                  ) : (
                                    <><Edit className="h-3 w-3 mr-1" />Modificación</>
                                  )}
                                </Badge>
                              </div>
                              
                              <div>
                                <p className="font-medium">
                                  {solicitud.tipoSolicitud === "cancelacion" 
                                    ? `Motivo: ${solicitud.motivoCancelacion}`
                                    : `Modificar: ${solicitud.tipoModificacion}`}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {solicitud.compradorEmail}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(solicitud.fechaCreacion).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSolicitud(solicitud)
                                  setShowSolicitudDialog(true)
                                }}
                              >
                                Ver Detalles
                              </Button>
                              
                              {solicitud.estado === "pendiente" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleSolicitudEstadoChange(solicitud.ticketNumber, "aprobado")}
                                  >
                                    Aprobar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleSolicitudEstadoChange(solicitud.ticketNumber, "rechazado")}
                                  >
                                    Rechazar
                                  </Button>
                                </>
                              )}
                              
                              {solicitud.estado === "aprobado" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSolicitudEstadoChange(solicitud.ticketNumber, "procesado")}
                                >
                                  Marcar Procesado
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalles Reclamo */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalles del Reclamo
            </DialogTitle>
            <DialogDescription>
              Información completa del reclamo {selectedReclamo?.ticketNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedReclamo && (
            <div className="space-y-6">
              {/* Estado y Ticket */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Ticket</p>
                  <p className="font-mono font-bold text-lg">{selectedReclamo.ticketNumber}</p>
                </div>
                {getEstadoBadge(selectedReclamo.estado)}
              </div>

              {/* Información del Pedido */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">INFORMACIÓN DEL PEDIDO</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Pedido</p>
                    <p className="font-medium">{selectedReclamo.numeroPedido}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Producto</p>
                    <p className="font-medium">{selectedReclamo.producto || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Reclamo</p>
                    <p className="font-medium">{getTipoReclamoLabel(selectedReclamo.tipoReclamo)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {new Date(selectedReclamo.fechaCreacion).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción del Problema */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">DESCRIPCIÓN DEL PROBLEMA</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedReclamo.descripcion}</p>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">INFORMACIÓN DE CONTACTO</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedReclamo.email}</span>
                  </div>
                  {selectedReclamo.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedReclamo.telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedReclamo.estado === "pendiente" && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleEstadoChange(selectedReclamo.ticketNumber, "en-proceso")
                      setShowDetailDialog(false)
                    }}
                  >
                    Atender Reclamo
                  </Button>
                )}
                
                {selectedReclamo.estado === "en-proceso" && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleEstadoChange(selectedReclamo.ticketNumber, "resuelto")
                        setShowDetailDialog(false)
                      }}
                    >
                      Marcar como Resuelto
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleEstadoChange(selectedReclamo.ticketNumber, "rechazado")
                        setShowDetailDialog(false)
                      }}
                    >
                      Rechazar
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowDetailDialog(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalles Solicitud */}
      <Dialog open={showSolicitudDialog} onOpenChange={setShowSolicitudDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalles de Solicitud
            </DialogTitle>
            <DialogDescription>
              Información completa de la solicitud {selectedSolicitud?.ticketNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedSolicitud && (
            <div className="space-y-6">
              {/* Estado y Ticket */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Ticket</p>
                  <p className="font-mono font-bold text-lg">{selectedSolicitud.ticketNumber}</p>
                </div>
                <div className="flex gap-2">
                  {getSolicitudBadge(selectedSolicitud.estado)}
                  <Badge className={selectedSolicitud.tipoSolicitud === "cancelacion" ? "bg-red-500" : "bg-blue-500"}>
                    {selectedSolicitud.tipoSolicitud === "cancelacion" ? "Cancelación" : "Modificación"}
                  </Badge>
                </div>
              </div>

              {/* Información del Pedido */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">INFORMACIÓN DEL PEDIDO</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Pedido</p>
                    <p className="font-medium">{selectedSolicitud.numeroPedido}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize">{selectedSolicitud.tipoSolicitud}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {new Date(selectedSolicitud.fechaCreacion).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles de Cancelación */}
              {selectedSolicitud.tipoSolicitud === "cancelacion" && (
                <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-sm text-red-900">DETALLES DE CANCELACIÓN</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Motivo</p>
                      <p className="font-medium">{selectedSolicitud.motivoCancelacion}</p>
                    </div>
                    {selectedSolicitud.metodoReembolso && (
                      <div>
                        <p className="text-sm text-muted-foreground">Método de Reembolso</p>
                        <p className="font-medium">{selectedSolicitud.metodoReembolso}</p>
                      </div>
                    )}
                    {selectedSolicitud.cuentaReembolso && (
                      <div>
                        <p className="text-sm text-muted-foreground">Cuenta para Reembolso</p>
                        <p className="font-medium font-mono">{selectedSolicitud.cuentaReembolso}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detalles de Modificación */}
              {selectedSolicitud.tipoSolicitud === "modificacion" && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-sm text-blue-900">DETALLES DE MODIFICACIÓN</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Modificación</p>
                      <p className="font-medium">{selectedSolicitud.tipoModificacion}</p>
                    </div>
                    {selectedSolicitud.nuevaDireccion && (
                      <div>
                        <p className="text-sm text-muted-foreground">Nueva Dirección</p>
                        <p className="font-medium">{selectedSolicitud.nuevaDireccion}</p>
                      </div>
                    )}
                    {selectedSolicitud.nuevoTelefono && (
                      <div>
                        <p className="text-sm text-muted-foreground">Nuevo Teléfono</p>
                        <p className="font-medium">{selectedSolicitud.nuevoTelefono}</p>
                      </div>
                    )}
                    {selectedSolicitud.detallesModificacion && (
                      <div>
                        <p className="text-sm text-muted-foreground">Detalles</p>
                        <p className="font-medium whitespace-pre-wrap">{selectedSolicitud.detallesModificacion}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comentarios Adicionales */}
              {selectedSolicitud.comentariosAdicionales && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">COMENTARIOS ADICIONALES</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedSolicitud.comentariosAdicionales}</p>
                  </div>
                </div>
              )}

              {/* Información de Contacto */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">INFORMACIÓN DE CONTACTO</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedSolicitud.email}</span>
                  </div>
                  {selectedSolicitud.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedSolicitud.telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedSolicitud.estado === "pendiente" && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleSolicitudEstadoChange(selectedSolicitud.ticketNumber, "aprobado")
                        setShowSolicitudDialog(false)
                      }}
                    >
                      Aprobar Solicitud
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleSolicitudEstadoChange(selectedSolicitud.ticketNumber, "rechazado")
                        setShowSolicitudDialog(false)
                      }}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
                
                {selectedSolicitud.estado === "aprobado" && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleSolicitudEstadoChange(selectedSolicitud.ticketNumber, "procesado")
                      setShowSolicitudDialog(false)
                    }}
                  >
                    Marcar como Procesado
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowSolicitudDialog(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
