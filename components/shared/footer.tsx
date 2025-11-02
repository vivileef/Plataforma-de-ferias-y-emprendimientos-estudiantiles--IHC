"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card/95 p-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="font-bold">Feria Artesanal</div>
          <div className="text-sm text-muted-foreground">Proyecto de demo académico. Derechos reservados.</div>
        </div>
        <div className="text-sm">
          <div>Soporte: <a className="text-primary hover:underline" href={`mailto:contacto@feria-artesanal.test`}>contacto@feria-artesanal.test</a></div>
          <div><Link href="/" className="text-primary hover:underline">Términos y Condiciones</Link> · <Link href="/" className="text-primary hover:underline">Política de privacidad</Link></div>
        </div>
      </div>
    </footer>
  )
}
