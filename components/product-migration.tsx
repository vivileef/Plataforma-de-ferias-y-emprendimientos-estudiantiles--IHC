"use client"

import { useEffect } from "react"
import { useProducts } from "./products-context"
import { getSession } from "./auth/users"

/**
 * Este componente actualiza automáticamente todos los productos existentes
 * para agregar el vendedorEmail basándose en la sesión actual del vendedor.
 * Se ejecuta solo una vez por sesión.
 */
export function ProductMigration() {
  const { products, updateProduct } = useProducts()

  useEffect(() => {
    const session = getSession()
    if (!session?.email || session.role !== "vendedor") return

    // Verificar si ya se ejecutó la migración para este usuario
    const migrationKey = `migration_vendedorEmail_${session.email}`
    if (localStorage.getItem(migrationKey)) return

    let updatedCount = 0

    // Actualizar solo los productos que no tienen vendedorEmail
    products.forEach((product) => {
      if (!product.vendedorEmail) {
        updateProduct(product.id, { vendedorEmail: session.email })
        updatedCount++
      }
    })

    if (updatedCount > 0) {
      console.log(`✅ Migración completada: ${updatedCount} productos actualizados con vendedorEmail`)
      localStorage.setItem(migrationKey, "true")
    }
  }, [products, updateProduct])

  return null // Este componente no renderiza nada
}
