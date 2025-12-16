"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, MessageSquare, User, Calendar, TrendingUp } from "lucide-react"
import { getSession } from "@/components/auth/users"
import { useProducts } from "@/components/products-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Resena {
  id: string
  productoId: string
  productoNombre: string
  calificacion: number
  titulo: string
  comentario: string
  nombreComprador: string
  email: string
  recomendaria: boolean
  fechaCreacion: string
  estado: string
  verificada: boolean
}

export function ResenasVendedor() {
  const [resenas, setResenas] = useState<Resena[]>([])
  const [filter, setFilter] = useState<"todas" | "5" | "4" | "3" | "2" | "1">("todas")
  const { products } = useProducts()

  useEffect(() => {
    loadResenas()
  }, [])

  const loadResenas = () => {
    try {
      const session = getSession()
      if (!session?.email) return

      const allResenas = JSON.parse(localStorage.getItem("marketplace_resenas") || "[]")
      
      // Filtrar reseñas de productos del vendedor
      const misResenas = allResenas.filter((resena: Resena) => {
        const product = products.find(p => p.id === resena.productoId)
        return product !== undefined
      })
      
      setResenas(misResenas)
    } catch (error) {
      console.error("Error al cargar reseñas:", error)
    }
  }

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  const getPromedioCalificacion = () => {
    if (resenas.length === 0) return 0
    const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0)
    return (suma / resenas.length).toFixed(1)
  }

  const getResenasporCalificacion = (rating: number) => {
    return resenas.filter(r => r.calificacion === rating).length
  }

  const getRecomendaciones = () => {
    if (resenas.length === 0) return 0
    const recomendadas = resenas.filter(r => r.recomendaria).length
    return ((recomendadas / resenas.length) * 100).toFixed(0)
  }

  const filteredResenas = resenas.filter(r => 
    filter === "todas" || r.calificacion === parseInt(filter)
  )

  const resenasPor5 = getResenasporCalificacion(5)
  const resenasPor4 = getResenasporCalificacion(4)
  const resenasPor3 = getResenasporCalificacion(3)
  const resenasPor2 = getResenasporCalificacion(2)
  const resenasPor1 = getResenasporCalificacion(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reseñas de Productos</h2>
        <p className="text-muted-foreground mt-1">
          Consulta las opiniones y calificaciones de tus clientes
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reseñas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resenas.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calificación Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{getPromedioCalificacion()}</div>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getRecomendaciones()}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              5 Estrellas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{resenasPor5}</div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de Calificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribución de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = getResenasporCalificacion(rating)
              const percentage = resenas.length > 0 ? (count / resenas.length) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reseñas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reseñas de Clientes
          </CardTitle>
          <CardDescription>
            Opiniones sobre tus productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="todas">Todas ({resenas.length})</TabsTrigger>
              <TabsTrigger value="5">5★ ({resenasPor5})</TabsTrigger>
              <TabsTrigger value="4">4★ ({resenasPor4})</TabsTrigger>
              <TabsTrigger value="3">3★ ({resenasPor3})</TabsTrigger>
              <TabsTrigger value="2">2★ ({resenasPor2})</TabsTrigger>
              <TabsTrigger value="1">1★ ({resenasPor1})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              {filteredResenas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay reseñas en esta categoría</p>
                </div>
              ) : (
                filteredResenas.map((resena) => (
                  <Card key={resena.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header de la reseña */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {resena.nombreComprador
                                  .split(" ")
                                  .map(n => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{resena.nombreComprador}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(resena.calificacion, "sm")}
                                <span className="text-sm text-muted-foreground">
                                  {new Date(resena.fechaCreacion).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {resena.verificada && (
                            <Badge variant="secondary" className="gap-1">
                              <User className="h-3 w-3" />
                              Compra verificada
                            </Badge>
                          )}
                        </div>

                        {/* Producto reseñado */}
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">
                            {resena.productoNombre}
                          </Badge>
                        </div>

                        {/* Título y comentario */}
                        <div>
                          <h4 className="font-semibold mb-2">{resena.titulo}</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {resena.comentario}
                          </p>
                        </div>

                        {/* Recomendación */}
                        {resena.recomendaria && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Recomendaría este producto</span>
                          </div>
                        )}

                        {/* Acciones (opcional para futuras funcionalidades) */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Útil
                          </Button>
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
    </div>
  )
}
