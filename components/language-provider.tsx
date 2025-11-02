"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type Lang = "es" | "en"

type Translations = Record<string, string>

const dictionary: Record<Lang, Translations> = {
  es: {
    headerTitle: "Feria Artesanal",
    heroTitle: "Conectando Artesanos con Compradores",
    heroSubtitle:
      "Una plataforma donde los vendedores pueden ofrecer sus productos artesanales y los compradores pueden descubrir productos únicos y auténticos.",
    cardVendorTitle: "Vendedor",
    cardVendorDesc: "Publica y gestiona tus productos artesanales",
    cardBuyerTitle: "Comprador",
    cardBuyerDesc: "Descubre y compra productos únicos",
    cardAdminTitle: "Administrador",
    cardAdminDesc: "Gestiona usuarios y publicaciones",
    btnLogin: "Iniciar Sesión",
    btnRegister: "Registrarse",
    featuresTitle: "Características de la Plataforma",
    featuresVendor1: "Publica productos con fotos y descripciones",
    featuresVendor2: "Gestiona tu inventario fácilmente",
    featuresVendor3: "Recibe notificaciones de ventas",
    featuresVendor4: "Panel de control intuitivo",
    featuresBuyer1: "Explora productos artesanales únicos",
    featuresBuyer2: "Búsqueda y filtros avanzados",
    featuresBuyer3: "Carrito de compras sencillo",
    featuresBuyer4: "Historial de pedidos",
    footerCopyright: "© 2025 Feria Artesanal. Plataforma de demostración.",
    footerTag: "Conectando comunidades artesanales",
  categoriesTitle: "Categorías",
  "categories.all": "Todas las Categorías",
  "categories.artesania": "Artesanía",
  "categories.alimentos": "Alimentos",
  "categories.cosmetica": "Cosmética",
  "categories.textil": "Textil",
  "categories.decoracion": "Decoración",
  "categories.joyeria": "Joyería",
    termsTitle: "Términos y Condiciones",
    termsContent:
      "Estos son los términos y condiciones de la plataforma de demostración. Uso responsable, respeto a la propiedad intelectual y cumplimiento de la normativa local. Esta versión es un ejemplo para la entrega académica.",
    vendorDashboardTitle: "Panel de Vendedor",
    vendorDashboardSubtitle: "Gestiona tus productos artesanales",
    addProductButton: "Añadir Producto",
    addProductTitle: "Añadir Nuevo Producto",
    buyerExploreTitle: "Explorar Productos",
    buyerExploreSubtitle: "Descubre productos artesanales únicos",
    searchPlaceholder: "Buscar productos...",
    viewCart: "Ver Carrito",
    contactSeller: "Contactar",
    contactEmail: "contacto@feria-artesanal.test",
    contactSubjectPrefix: "Consulta sobre",
    contactSectionTitle: "Contáctanos",
    contactSectionDesc: "¿Tienes dudas o quieres colaborar con nosotros? Escríbenos y te responderemos lo antes posible.",
  },
  en: {
    headerTitle: "Handmade Fair",
    heroTitle: "Connecting Artisans with Buyers",
    heroSubtitle:
      "A platform where sellers can offer their handmade products and buyers can discover unique, authentic items.",
    cardVendorTitle: "Seller",
    cardVendorDesc: "Publish and manage your handmade products",
    cardBuyerTitle: "Buyer",
    cardBuyerDesc: "Discover and purchase unique products",
    cardAdminTitle: "Administrator",
    cardAdminDesc: "Manage users and listings",
    btnLogin: "Log In",
    btnRegister: "Register",
    featuresTitle: "Platform Features",
    featuresVendor1: "Publish products with photos and descriptions",
    featuresVendor2: "Manage your inventory easily",
    featuresVendor3: "Receive sale notifications",
    featuresVendor4: "Intuitive dashboard",
    featuresBuyer1: "Explore unique handcrafted products",
    featuresBuyer2: "Advanced search and filters",
    featuresBuyer3: "Simple shopping cart",
    featuresBuyer4: "Order history",
    footerCopyright: "© 2025 Handmade Fair. Demo platform.",
    footerTag: "Connecting artisan communities",
  categoriesTitle: "Categories",
  "categories.all": "All Categories",
  "categories.artesania": "Handicrafts",
  "categories.alimentos": "Food",
  "categories.cosmetica": "Cosmetics",
  "categories.textil": "Textiles",
  "categories.decoracion": "Home Decor",
  "categories.joyeria": "Jewelry",
    termsTitle: "Terms and Conditions",
    termsContent:
      "These are the terms and conditions for the demo platform. Responsible use, respect for intellectual property, and compliance with local regulations. This is an example version for academic delivery.",
    vendorDashboardTitle: "Seller Dashboard",
    vendorDashboardSubtitle: "Manage your handmade product listings",
    addProductButton: "Add Product",
    addProductTitle: "Add New Product",
    buyerExploreTitle: "Explore Products",
    buyerExploreSubtitle: "Discover unique handcrafted products",
    searchPlaceholder: "Search products...",
    viewCart: "View Cart",
    contactSeller: "Contact",
    contactEmail: "contact@handmadefair.test",
    contactSubjectPrefix: "Inquiry about",
    contactSectionTitle: "Contact Us",
    contactSectionDesc: "Have questions or want to collaborate? Write to us and we'll reply as soon as possible.",
  },
}

type LangContext = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LangContext | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = typeof window !== "undefined" && localStorage.getItem("locale")
      return (stored as Lang) || "es"
    } catch (e) {
      return "es"
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("locale", lang)
    } catch (e) {
      // ignore
    }
  }, [lang])

  const t = useMemo(() => (key: string) => dictionary[lang][key] || key, [lang])

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}

export default LanguageProvider
