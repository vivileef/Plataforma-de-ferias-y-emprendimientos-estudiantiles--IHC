"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  description: string
  image: string
  descuento?: number
  precioDescuento?: number
}

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (id: string, product: any) => void
  product: Product | null
}

export function EditProductDialog({ open, onOpenChange, onEdit, product }: EditProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    descuento: "",
    tieneDescuento: false,
  })

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        description: product.description || "",
        descuento: product.descuento?.toString() || "",
        tieneDescuento: (product.descuento && product.descuento > 0) || false,
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const precio = Number.parseFloat(formData.price)
    const descuento = formData.tieneDescuento ? Number.parseFloat(formData.descuento) : 0
    const precioDescuento = descuento > 0 ? precio * (1 - descuento / 100) : precio

    onEdit(product.id, {
      name: formData.name,
      price: precio,
      stock: Number.parseInt(formData.stock),
      category: formData.category,
      description: formData.description,
      descuento: descuento,
      precioDescuento: precioDescuento,
    })
    onOpenChange(false)
  }

  const calcularPrecioConDescuento = () => {
    if (!formData.tieneDescuento || !formData.descuento) return null
    const precio = Number.parseFloat(formData.price) || 0
    const descuento = Number.parseFloat(formData.descuento) || 0
    return precio * (1 - descuento / 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Actualiza la información de tu producto artesanal</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Producto</Label>
              <Input
                id="edit-name"
                placeholder="Ej: Cesta de mimbre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio (€)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Artesanía">Artesanía</SelectItem>
                  <SelectItem value="Alimentos">Alimentos</SelectItem>
                  <SelectItem value="Cosmética">Cosmética</SelectItem>
                  <SelectItem value="Textil">Textil</SelectItem>
                  <SelectItem value="Decoración">Decoración</SelectItem>
                  <SelectItem value="Joyería">Joyería</SelectItem>
                </SelectContent>

            {/* Sección de Descuento */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-tiene-descuento"
                  checked={formData.tieneDescuento}
                  onChange={(e) => setFormData({ ...formData, tieneDescuento: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <Label htmlFor="edit-tiene-descuento" className="cursor-pointer font-semibold">
                  Aplicar Descuento/Promoción
                </Label>
              </div>

              {formData.tieneDescuento && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-descuento">Porcentaje de Descuento (%)</Label>
                    <Input
                      id="edit-descuento"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="10"
                      value={formData.descuento}
                      onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ingresa un porcentaje entre 0% y 100%
                    </p>
                  </div>

                  {formData.price && formData.descuento && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900">Vista Previa del Precio:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg line-through text-gray-500">
                          €{Number.parseFloat(formData.price).toFixed(2)}
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          €{calcularPrecioConDescuento()?.toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                          -{formData.descuento}%
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Ahorras: €{(Number.parseFloat(formData.price) - (calcularPrecioConDescuento() || 0)).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe tu producto..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
