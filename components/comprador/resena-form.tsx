"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Star, CheckCircle, ArrowLeft, Upload, X, MessageSquare } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSession } from "@/components/auth/users"
import { useProducts } from "@/components/products-context"
import Link from "next/link"

interface ResenaFormData {
  productoId: string
  productoNombre: string
  calificacion: number
  titulo: string
  comentario: string
  nombreComprador: string
  email: string
  archivos: File[]
  recomendaria: boolean
}

export function ResenaForm() {
  const { toast } = useToast()
  const { products } = useProducts()
  const [formData, setFormData] = useState<ResenaFormData>({
    productoId: "",
    productoNombre: "",
    calificacion: 0,
    titulo: "",
    comentario: "",
    nombreComprador: "",
    email: "",
    archivos: [],
    recomendaria: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    const session = getSession()
    if (session?.email) {
      setFormData(prev => ({
        ...prev,
        email: session.email,
        nombreComprador: session.name || ""
      }))
    }
  }, [])

  const handleInputChange = (field: keyof ResenaFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setFormData(prev => ({
        ...prev,
        productoId: productId,
        productoNombre: product.name
      }))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const totalFiles = formData.archivos.length + newFiles.length
      
      if (totalFiles > 5) {
        toast({
          title: "Límite de archivos excedido",
          description: "Puedes subir un máximo de 5 imágenes",
          variant: "destructive",
        })
        return
      }

      const invalidFiles = newFiles.filter((file) => file.size > 5 * 1024 * 1024)
      if (invalidFiles.length > 0) {
        toast({
          title: "Archivos demasiado grandes",
          description: "Cada imagen debe ser menor a 5MB",
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
    
    if (!formData.productoId || !formData.calificacion || !formData.titulo || !formData.comentario) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (formData.calificacion < 1 || formData.calificacion > 5) {
      toast({
        title: "Calificación requerida",
        description: "Por favor selecciona una calificación de 1 a 5 estrellas",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const resena = {
        id: `RES-${Date.now()}`,
        ...formData,
        fechaCreacion: new Date().toISOString(),
        estado: "publicada",
        verificada: false,
      }

      const resenas = JSON.parse(localStorage.getItem("marketplace_resenas") || "[]")
      resenas.push(resena)
      localStorage.setItem("marketplace_resenas", JSON.stringify(resenas))

      setSubmitSuccess(true)
      setIsSubmitting(false)

      toast({
        title: "¡Reseña publicada exitosamente!",
        description: "Gracias por compartir tu opinión",
      })

      setFormData({
        productoId: "",
        productoNombre: "",
        calificacion: 0,
        titulo: "",
        comentario: "",
        nombreComprador: formData.nombreComprador,
        email: formData.email,
        archivos: [],
        recomendaria: true,
      })
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "Error",
        description: "No se pudo publicar la reseña. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const renderStars = (interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 cursor-pointer transition-all ${
              star <= (interactive ? (hoveredStar || formData.calificacion) : formData.calificacion)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => interactive && handleInputChange("calificacion", star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
          />
        ))}
      </div>
    )
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
            <CardTitle className="text-2xl text-green-700">¡Reseña Publicada!</CardTitle>
            <CardDescription className="text-base">
              Tu opinión ha sido publicada y ayudará a otros compradores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Tu calificación:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= formData.calificacion
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Tu reseña será visible para todos los usuarios. Las reseñas ayudan a mejorar la calidad 
                del servicio y orientan las decisiones de otros compradores.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button 
                onClick={() => setSubmitSuccess(false)} 
                className="flex-1"
              >
                Escribir Otra Reseña
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
            <MessageSquare className="h-6 w-6" />
            Escribir una Reseña
          </CardTitle>
          <CardDescription>
            Comparte tu experiencia con otros compradores. Tu opinión es muy valiosa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de Producto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Producto a Reseñar</h3>
              
              <div className="space-y-2">
                <Label htmlFor="producto">
                  Selecciona el Producto <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.productoId}
                  onValueChange={handleProductSelect}
                  required
                >
                  <SelectTrigger id="producto">
                    <SelectValue placeholder="Elige el producto que deseas reseñar" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - €{product.price.toFixed(2)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-products" disabled>
                        No hay productos disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Calificación */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Tu Calificación</h3>
              
              <div className="space-y-2">
                <Label>
                  ¿Cómo calificarías este producto? <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  {renderStars(true)}
                  {formData.calificacion > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {formData.calificacion === 1 && "Muy malo"}
                      {formData.calificacion === 2 && "Malo"}
                      {formData.calificacion === 3 && "Regular"}
                      {formData.calificacion === 4 && "Bueno"}
                      {formData.calificacion === 5 && "Excelente"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="recomendaria"
                  checked={formData.recomendaria}
                  onChange={(e) => handleInputChange("recomendaria", e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <Label htmlFor="recomendaria" className="cursor-pointer">
                  Recomendaría este producto a otros
                </Label>
              </div>
            </div>

            {/* Reseña Escrita */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Tu Opinión</h3>
              
              <div className="space-y-2">
                <Label htmlFor="titulo">
                  Título de tu Reseña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Excelente calidad y acabados"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">
                  {formData.titulo.length}/100 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comentario">
                  Cuéntanos tu Experiencia <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="comentario"
                  placeholder="Comparte detalles sobre el producto: calidad, tamaño, color, tiempo de entrega, atención del vendedor, etc."
                  value={formData.comentario}
                  onChange={(e) => handleInputChange("comentario", e.target.value)}
                  rows={6}
                  required
                  className="resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">
                  {formData.comentario.length}/1000 caracteres. Mínimo 20 caracteres.
                </p>
              </div>

              {/* Fotos */}
              <div className="space-y-2">
                <Label htmlFor="archivos">Agrega Fotos (Opcional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="archivos" className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Haz clic para subir fotos
                      </span>
                      <input
                        id="archivos"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 5 imágenes, 5MB cada una
                  </p>
                </div>

                {formData.archivos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.archivos.map((file, index) => (
                      <div
                        key={index}
                        className="relative group border rounded-lg overflow-hidden"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Información del Reseñador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Tu Información</h3>
              
              <div className="space-y-2">
                <Label htmlFor="nombreComprador">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombreComprador"
                  placeholder="Tu nombre"
                  value={formData.nombreComprador}
                  onChange={(e) => handleInputChange("nombreComprador", e.target.value)}
                  required
                />
              </div>

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
                <p className="text-xs text-gray-500">
                  Tu correo no se mostrará públicamente
                </p>
              </div>
            </div>

            {/* Guías para Reseña */}
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <strong>Consejos para una buena reseña:</strong>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Sé específico sobre lo que te gustó o no</li>
                  <li>Menciona la calidad, tamaño, color y acabados</li>
                  <li>Comenta sobre el tiempo de entrega</li>
                  <li>Sé honesto pero respetuoso</li>
                </ul>
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
                    Publicando...
                  </>
                ) : (
                  "Publicar Reseña"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentEmail = formData.email
                  const currentNombre = formData.nombreComprador
                  setFormData({
                    productoId: "",
                    productoNombre: "",
                    calificacion: 0,
                    titulo: "",
                    comentario: "",
                    nombreComprador: currentNombre,
                    email: currentEmail,
                    archivos: [],
                    recomendaria: true,
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
