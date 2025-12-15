"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Upload, X, CheckCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllUsers, getSession } from "@/components/auth/users"
import Link from "next/link"

interface ReclamoFormData {
  numeroPedido: string
  tipoReclamo: string
  producto: string
  vendedorEmail: string
  descripcion: string
  email: string
  telefono: string
  archivos: File[]
}

export function ReclamosForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ReclamoFormData>({
    numeroPedido: "",
    tipoReclamo: "",
    producto: "",
    vendedorEmail: "",
    descripcion: "",
    email: "",
    telefono: "",
    archivos: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [vendedores, setVendedores] = useState<Array<{ email: string; name?: string }>>([])

  useEffect(() => {
    // Obtener lista de vendedores
    const users = getAllUsers()
    const sellers = users.filter(u => u.role === "vendedor")
    setVendedores(sellers)

    // Pre-rellenar el email del usuario actual si está logueado
    const session = getSession()
    if (session?.email) {
      setFormData(prev => ({ ...prev, email: session.email }))
    }
  }, [])

  const handleInputChange = (field: keyof ReclamoFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const totalFiles = formData.archivos.length + newFiles.length
      
      if (totalFiles > 5) {
        toast({
          title: "Límite de archivos excedido",
          description: "Puedes subir un máximo de 5 archivos",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB per file)
      const invalidFiles = newFiles.filter((file) => file.size > 5 * 1024 * 1024)
      if (invalidFiles.length > 0) {
        toast({
          title: "Archivos demasiado grandes",
          description: "Cada archivo debe ser menor a 5MB",
          variant: "destructive",
        })
        return
      }

      setFormData((prev) => ({
        ...prev,
        archivos: [...prev.archivos, ...newFiles],
      }))
    }
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación
    if (!formData.numeroPedido || !formData.tipoReclamo || !formData.descripcion || !formData.email || !formData.vendedorEmail) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Guardar reclamo en localStorage
    try {
      const newTicketNumber = `REC-${Date.now().toString().slice(-8)}`
      const reclamo = {
        ticketNumber: newTicketNumber,
        ...formData,
        estado: "pendiente",
        fechaCreacion: new Date().toISOString(),
        compradorEmail: formData.email,
      }

      const reclamos = JSON.parse(localStorage.getItem("marketplace_reclamos") || "[]")
      reclamos.push(reclamo)
      localStorage.setItem("marketplace_reclamos", JSON.stringify(reclamos))

      setTicketNumber(newTicketNumber)
      setSubmitSuccess(true)
      setIsSubmitting(false)

      toast({
        title: "¡Reclamo enviado exitosamente!",
        description: `Tu número de ticket es: ${newTicketNumber}`,
      })

      // Limpiar formulario pero mantener el email
      const currentEmail = formData.email
      setFormData({
        numeroPedido: "",
        tipoReclamo: "",
        producto: "",
        vendedorEmail: "",
        descripcion: "",
        email: currentEmail,
        telefono: "",
        archivos: [],
      })
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "Error",
        description: "No se pudo enviar el reclamo. Intenta nuevamente.",
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
            <CardTitle className="text-2xl text-green-700">¡Reclamo Enviado Exitosamente!</CardTitle>
            <CardDescription className="text-base">
              Hemos recibido tu reclamo y lo procesaremos a la brevedad
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
                Recibirás una confirmación por correo electrónico con los detalles de tu reclamo. 
                Puedes usar el número de ticket para dar seguimiento al estado de tu solicitud.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Tiempo de respuesta estimado:</strong> 24-48 horas hábiles</p>
              <p><strong>Te contactaremos por:</strong> {formData.email}</p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setSubmitSuccess(false)} 
                className="flex-1"
              >
                Enviar Otro Reclamo
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
          <CardTitle className="text-2xl">Formulario de Reclamos y Devoluciones</CardTitle>
          <CardDescription>
            Completa el formulario para reportar problemas con tu pedido. Responderemos en un plazo de 24-48 horas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="producto">Nombre del Producto</Label>
                <Input
                  id="producto"
                  placeholder="Ej: Camiseta Universitaria XL"
                  value={formData.producto}
                  onChange={(e) => handleInputChange("producto", e.target.value)}
                />
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
                <p className="text-xs text-gray-500">
                  Selecciona el vendedor al que le compraste el producto
                </p>
              </div>
            </div>

            {/* Tipo de Reclamo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Tipo de Reclamo</h3>
              
              <div className="space-y-2">
                <Label htmlFor="tipoReclamo">
                  Selecciona el motivo de tu reclamo <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tipoReclamo}
                  onValueChange={(value) => handleInputChange("tipoReclamo", value)}
                  required
                >
                  <SelectTrigger id="tipoReclamo">
                    <SelectValue placeholder="Selecciona un tipo de reclamo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producto-defectuoso">Producto Defectuoso</SelectItem>
                    <SelectItem value="producto-incorrecto">Producto Incorrecto / No es lo que pedí</SelectItem>
                    <SelectItem value="producto-danado">Producto Dañado en el Envío</SelectItem>
                    <SelectItem value="producto-faltante">Producto Faltante / No Recibido</SelectItem>
                    <SelectItem value="descripcion-incorrecta">Descripción No Coincide con el Producto</SelectItem>
                    <SelectItem value="calidad-insatisfactoria">Calidad Insatisfactoria</SelectItem>
                    <SelectItem value="retraso-entrega">Retraso en la Entrega</SelectItem>
                    <SelectItem value="otro">Otro Motivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción del Problema */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Descripción del Problema</h3>
              
              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  Describe el problema en detalle <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Por favor, proporciona todos los detalles relevantes sobre el problema que experimentaste..."
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  rows={6}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Incluye detalles como: estado del producto, qué esperabas, qué recibiste, etc.
                </p>
              </div>

              {/* Evidencia/Archivos */}
              <div className="space-y-2">
                <Label htmlFor="archivos">Evidencia (Fotos/Documentos)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="archivos" className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Haz clic para subir archivos
                      </span>
                      <input
                        id="archivos"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 5 archivos, 5MB cada uno (Imágenes o PDF)
                  </p>
                </div>

                {/* Lista de archivos subidos */}
                {formData.archivos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.archivos.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                />
              </div>
            </div>

            {/* Información Importante */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Política de Devoluciones:</strong> Las devoluciones se aceptan dentro de los 7 días posteriores 
                a la recepción del producto. Los productos deben estar en su estado original con etiquetas y empaque.
              </AlertDescription>
            </Alert>

            {/* Botones de Acción */}
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
                  "Enviar Reclamo"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    numeroPedido: "",
                    tipoReclamo: "",
                    producto: "",
                    descripcion: "",
                    email: "",
                    telefono: "",
                    archivos: [],
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
