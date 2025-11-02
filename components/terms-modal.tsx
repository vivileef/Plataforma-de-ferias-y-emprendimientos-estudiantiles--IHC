"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function TermsModal() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm">{t("termsTitle")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("termsTitle")}</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          <p>{t("termsContent")}</p>
        </div>
        <div className="mt-4 text-right">
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TermsModal
