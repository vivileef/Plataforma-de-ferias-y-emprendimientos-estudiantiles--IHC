"use client"

import React from "react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant={lang === "es" ? "default" : "ghost"} onClick={() => setLang("es")}>ES</Button>
      <Button size="sm" variant={lang === "en" ? "default" : "ghost"} onClick={() => setLang("en")}>EN</Button>
    </div>
  )
}

export default LanguageToggle
