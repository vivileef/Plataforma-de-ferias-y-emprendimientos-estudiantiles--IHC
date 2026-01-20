"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface Product {
  id: string
  name: string
  price: number
  seller: string
  stock: number
  category: string
  image: string
  description: string
  vendedorEmail?: string
  descuento?: number
  precioDescuento?: number
}

type ProductsContextType = {
  products: Product[]
  addProduct: (p: Omit<Product, "id">) => void
  updateProduct: (id: string, p: Partial<Omit<Product, "id">>) => void
  deleteProduct: (id: string) => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

const LOCAL_KEY = "marketplace_products_v1"

const SEED: Product[] = [
  {
    id: "1",
    name: "Cesta de Mimbre Artesanal",
    price: 45.0,
    seller: "María García",
    stock: 12,
    category: "Artesanía",
    image: "/handmade-wicker-basket.jpg",
    description:
      "Hermosa cesta tejida a mano con mimbre natural. Perfecta para almacenamiento o decoración.",
  },
  {
    id: "2",
    name: "Miel Orgánica 500g",
    price: 12.5,
    seller: "Juan Martínez",
    stock: 30,
    category: "Alimentos",
    image: "/organic-honey-jar.jpg",
    description: "Miel pura de flores silvestres, cosechada de forma sostenible.",
  },
  {
    id: "3",
    name: "Jabón Natural de Lavanda",
    price: 8.0,
    seller: "Ana López",
    stock: 25,
    category: "Cosmética",
    image: "/lavender-natural-soap.jpg",
    description: "Jabón artesanal elaborado con aceites esenciales de lavanda.",
  },
]

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem(LOCAL_KEY)
      if (raw) return JSON.parse(raw) as Product[]
    } catch (e) {
      // ignore
    }
    return SEED
  })

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(products))
    } catch (e) {
      // ignore
    }
  }, [products])

  const addProduct = (p: Omit<Product, "id">) => {
    const newProduct: Product = { ...p, id: Date.now().toString() }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, p: Partial<Omit<Product, "id">>) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...p } : product)))
  }

  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((x) => x.id !== id))

  return <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider")
  return ctx
}

export default ProductsProvider
