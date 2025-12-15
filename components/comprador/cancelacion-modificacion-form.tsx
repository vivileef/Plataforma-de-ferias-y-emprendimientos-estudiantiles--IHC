"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, ArrowLeft, Package } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllUsers, getSession } from "@/components/auth/users"
import Link from "next/link"

interface SolicitudFormData {
  numeroPedido: string
  tipoSolicitud: "cancelacion" | "modificacion" | ""
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
}

export function CancelacionModificacionForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<SolicitudFormData>({
    numeroPedido: "",
    tipoSolicitud: "",
    vendedorEmail: "",
    motivoCancelacion: "",
    tipoModificacion: "",
    detallesModificacion: "",
    nuevaDireccion: "",
    nuevoTelefono: "",
    metodoReembolso: "",
    cuentaReembolso: "",
    comentariosAdicionales: "",
    email: "",
    telefono: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [vendedores, setVendedores] = useState<Array<{ email: string; name?: string }>>([])

  useEffect(() => {
    const users = getAllUsers()
    const sellers = users.filter(u => u.role === "vendedor")
    setVendedores(sellers)

    const session = getSession()
    if (session?.email) {
      setFormData(prev => ({ ...prev, email: session.email }))
    }
  }, [])

  const handleInputChange = (field: keyof SolicitudFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.numeroPedido || !formData.tipoSolicitud || !formData.email || !formData.vendedorEmail) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validaciones específicas por tipo
    if (formData.tipoSolicitud === "cancelacion") {
      if (!formData.motivoCancelacion) {
        toast({
          title: "Campo requerido",
          description: "Debes especificar el motivo de cancelación",
          variant: "destructive",
        })
        return
      }
      if (formData.motivoCancelacion === "otro" && !formData.comentariosAdicionales) {
        toast({
          title: "Campo requerido",
          description: "Especifica el motivo en comentarios adicionales",
          variant: "destructive",
        })
        return
      }
    }

    if (formData.tipoSolicitud === "modificacion" && !formData.tipoModificacion) {
      toast({
        title: "Campo requerido",
        description: "Debes especificar qué deseas modificar",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newTicketNumber = `SOL-${Date.now().toString().slice(-8)}`
      const solicitud = {
        ticketNumber: newTicketNumber,
        ...formData,
        estado: "pendiente",
        fechaCreacion: new Date().toISOString(),
        compradorEmail: formData.email,
      }

      const solicitudes = JSON.parse(localStorage.getItem("marketplace_solicitudes") || "[]")
      solicitudes.push(solicitud)
      localStorage.setItem("marketplace_solicitudes", JSON.stringify(solicitudes))

      setTicketNumber(newTicketNumber)
      setSubmitSuccess(true)
      setIsSubmitting(false)

      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: `Tu número de ticket es: ${newTicketNumber}`,
      })

      const currentEmail = formData.email
      setFormData({
        numeroPedido: "",
        tipoSolicitud: "",
        vendedorEmail: "",
        motivoCancelacion: "",
        tipoModificacion: "",
        detallesModificacion: "",
        nuevaDireccion: "",
        nuevoTelefono: "",
        metodoReembolso: "",
        cuentaReembolso: "",
        comentariosAdicionales: "",
        email: currentEmail,
        telefono: "",
      })
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <Link href="/comprador/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">¡Solicitud Enviada Exitosamente!</CardTitle>
            <CardDescription className="text-base">
              Procesaremos tu solicitud de {formData.tipoSolicitud === "cancelacion" ? "cancelación" : "modificación"} a la brevedad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Tu número de ticket es:</p>
              <p className="text-2xl font-bold text-green-700">{ticketNumber}</p>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El vendedor revisará tu solicitud y te contactará para confirmar. 
                Las solicitudes se procesan en orden de llegada, sujetas a disponibilidad y estado del pedido.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Tiempo de respuesta estimado:</strong> 12-24 horas hábiles</p>
              <p><strong>Te contactaremos por:</strong> {formData.email}</p>
              {formData.tipoSolicitud === "cancelacion" && (
                <p className="text-amber-600"><strong>Nota:</strong> Si tu pedido ya fue enviado, puede no ser posible cancelarlo.</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setSubmitSuccess(false)} 
                className="flex-1"
              >
                Enviar Otra Solicitud
              </Button>
              <Link href="/comprador/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Ir al Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <Link href="/comprador/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6" />
            Cancelación / Modificación de Pedidos
          </CardTitle>
          <CardDescription>
            Solicita cambios o cancela tu pedido antes de que sea procesado. Tiempo de respuesta: 12-24 horas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alerta Importante */}
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Importante:</strong> Las solicitudes de cancelación o modificación solo se pueden procesar 
                si el pedido aún no ha sido enviado. Actúa lo antes posible.
              </AlertDescription>
            </Alert>

            {/* Información del Pedido */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Información del Pedido</h3>
              
              <div className="space-y-2">
                <Label htmlFor="numeroPedido">
                  Número de Pedido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numeroPedido"
                  placeholder="Ej: ORD-12345678"
                  value={formData.numeroPedido}
                  onChange={(e) => handleInputChange("numeroPedido", e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Encuentra tu número de pedido en el correo de confirmación
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendedor">
                  Vendedor <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.vendedorEmail}
                  onValueChange={(value) => handleInputChange("vendedorEmail", value)}
                  required
                >
                  <SelectTrigger id="vendedor">
                    <SelectValue placeholder="Selecciona el vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedores.length > 0 ? (
                      vendedores.map((vendedor) => (
                        <SelectItem key={vendedor.email} value={vendedor.email}>
                          {vendedor.name || vendedor.email}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-vendedores" disabled>
                        No hay vendedores disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo de Solicitud */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Tipo de Solicitud</h3>
              
              <div className="space-y-2">
                <Label>
                  ¿Qué deseas hacer? <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.tipoSolicitud}
                  onValueChange={(value) => handleInputChange("tipoSolicitud", value as "cancelacion" | "modificacion")}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="cancelacion" id="cancelacion" />
                    <Label htmlFor="cancelacion" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">Cancelar Pedido</p>
                        <p className="text-xs text-muted-foreground">Solicitar reembolso y cancelación completa</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="modificacion" id="modificacion" />
                    <Label htmlFor="modificacion" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">Modificar Pedido</p>
                        <p className="text-xs text-muted-foreground">Cambiar detalles del pedido (dirección, productos, etc.)</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Formulario de Cancelación */}
            {formData.tipoSolicitud === "cancelacion" && (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-900">Detalles de Cancelación</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="motivoCancelacion">
                    Motivo de Cancelación <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.motivoCancelacion}
                    onValueChange={(value) => handleInputChange("motivoCancelacion", value)}
                    required
                  >
                    <SelectTrigger id="motivoCancelacion">
                      <SelectValue placeholder="Selecciona el motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error-pedido">Pedí por Error</SelectItem>
                      <SelectItem value="encontre-mejor-precio">Encontré Mejor Precio</SelectItem>
                      <SelectItem value="demora-envio">Demora en el Envío</SelectItem>
                      <SelectItem value="cambio-opinion">Cambié de Opinión</SelectItem>
                      <SelectItem value="error-datos">Error en Datos del Pedido</SelectItem>
                      <SelectItem value="duplicado">Pedido Duplicado</SelectItem>
                      <SelectItem value="otro">Otro Motivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodoReembolso">
                    Método de Reembolso Preferido <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.metodoReembolso}
                    onValueChange={(value) => handleInputChange("metodoReembolso", value)}
                  >
                    <SelectTrigger id="metodoReembolso">
                      <SelectValue placeholder="Selecciona el método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="misma-forma-pago">Misma Forma de Pago Original</SelectItem>
                      <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                      <SelectItem value="credito-tienda">Crédito en la Tienda</SelectItem>
                      <SelectItem value="efectivo">Efectivo (en punto de recogida)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.metodoReembolso === "transferencia" && (
                  <div className="space-y-2">
                    <Label htmlFor="cuentaReembolso">
                      Número de Cuenta Bancaria
                    </Label>
                    <Input
                      id="cuentaReembolso"
                      placeholder="Ej: ES12 3456 7890 1234 5678"
                      value={formData.cuentaReembolso}
                      onChange={(e) => handleInputChange("cuentaReembolso", e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Formulario de Modificación */}
            {formData.tipoSolicitud === "modificacion" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900">Detalles de Modificación</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="tipoModificacion">
                    ¿Qué deseas modificar? <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tipoModificacion}
                    onValueChange={(value) => handleInputChange("tipoModificacion", value)}
                    required
                  >
                    <SelectTrigger id="tipoModificacion">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direccion-envio">Dirección de Envío</SelectItem>
                      <SelectItem value="telefono-contacto">Teléfono de Contacto</SelectItem>
                      <SelectItem value="producto-cantidad">Producto o Cantidad</SelectItem>
                      <SelectItem value="color-talla">Color / Talla / Variante</SelectItem>
                      <SelectItem value="metodo-envio">Método de Envío</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipoModificacion === "direccion-envio" && (
                  <div className="space-y-2">
                    <Label htmlFor="nuevaDireccion">
                      Nueva Dirección de Envío
                    </Label>
                    <Textarea
                      id="nuevaDireccion"
                      placeholder="Calle, número, ciudad, código postal, país..."
                      value={formData.nuevaDireccion}
                      onChange={(e) => handleInputChange("nuevaDireccion", e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {formData.tipoModificacion === "telefono-contacto" && (
                  <div className="space-y-2">
                    <Label htmlFor="nuevoTelefono">
                      Nuevo Teléfono de Contacto
                    </Label>
                    <Input
                      id="nuevoTelefono"
                      type="tel"
                      placeholder="+51 999 999 999"
                      value={formData.nuevoTelefono}
                      onChange={(e) => handleInputChange("nuevoTelefono", e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="detallesModificacion">
                    Detalles de la Modificación
                  </Label>
                  <Textarea
                    id="detallesModificacion"
                    placeholder="Describe claramente qué cambios necesitas..."
                    value={formData.detallesModificacion}
                    onChange={(e) => handleInputChange("detallesModificacion", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Comentarios Adicionales */}
            {formData.tipoSolicitud && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Información Adicional</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="comentariosAdicionales">
                    Comentarios Adicionales
                  </Label>
                  <Textarea
                    id="comentariosAdicionales"
                    placeholder="Agrega cualquier información relevante que pueda ayudarnos a procesar tu solicitud..."
                    value={formData.comentariosAdicionales}
                    onChange={(e) => handleInputChange("comentariosAdicionales", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Información de Contacto</h3>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono de Contacto</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                />
              </div>
            </div>

            {/* Política */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Política de Cancelación:</strong> Las solicitudes se procesan según disponibilidad. 
                Si el pedido ya fue enviado, puede aplicarse una tarifa de devolución. Los reembolsos se 
                procesan en 5-10 días hábiles.
              </AlertDescription>
            </Alert>

            {/* Botones */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitud"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentEmail = formData.email
                  setFormData({
                    numeroPedido: "",
                    tipoSolicitud: "",
                    vendedorEmail: "",
                    motivoCancelacion: "",
                    tipoModificacion: "",
                    detallesModificacion: "",
                    nuevaDireccion: "",
                    nuevoTelefono: "",
                    metodoReembolso: "",
                    cuentaReembolso: "",
                    comentariosAdicionales: "",
                    email: currentEmail,
                    telefono: "",
                  })
                }}
              >
                Limpiar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
