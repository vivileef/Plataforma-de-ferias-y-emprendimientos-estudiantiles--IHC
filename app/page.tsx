"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, ShoppingBag, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import TermsModal from "@/components/terms-modal"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Feria Estudiantil</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance text-foreground">{t("heroTitle")}</h2>
            <p className="text-xl text-muted-foreground mb-12 text-pretty">{t("heroSubtitle")}</p>

            {/* User Type Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t("cardVendorTitle")}</CardTitle>
                  <CardDescription>{t("cardVendorDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/vendedor/login">
                    <Button className="w-full" variant="default">
                      {t("btnLogin")}
                    </Button>
                  </Link>
                  <Link href="/vendedor/registro">
                    <Button className="w-full bg-transparent" variant="outline">
                      {t("btnRegister")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>{t("cardBuyerTitle")}</CardTitle>
                  <CardDescription>{t("cardBuyerDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/comprador/login">
                    <Button className="w-full" variant="default">
                      {t("btnLogin")}
                    </Button>
                  </Link>
                  <Link href="/comprador/registro">
                    <Button className="w-full bg-transparent" variant="outline">
                      {t("btnRegister")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>{t("cardAdminTitle")}</CardTitle>
                  <CardDescription>{t("cardAdminDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/admin/login">
                    <Button className="w-full" variant="default">
                      Acceso Admin
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-3xl font-bold text-center mb-12 text-foreground">{t("featuresTitle")}</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-foreground">Para Vendedores</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ {t("featuresVendor1")}</li>
                  <li>✓ {t("featuresVendor2")}</li>
                  <li>✓ {t("featuresVendor3")}</li>
                  <li>✓ {t("featuresVendor4")}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-foreground">Para Compradores</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ {t("featuresBuyer1")}</li>
                  <li>✓ {t("featuresBuyer2")}</li>
                  <li>✓ {t("featuresBuyer3")}</li>
                  <li>✓ {t("featuresBuyer4")}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Section */}
      <section className="py-12 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold mb-4 text-foreground">{t("contactSectionTitle")}</h3>
          <p className="text-muted-foreground mb-6">{t("contactSectionDesc")}</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href={`mailto:${t("contactEmail")}?subject=${encodeURIComponent(t("contactSubjectPrefix") + " - " + t("headerTitle"))}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
            >
              {t("contactSeller")} • {t("contactEmail")}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>{t("footerCopyright")}</p>
          <p className="text-sm mt-2">{t("footerTag")}</p>
          <div className="mt-3">
            <TermsModal />
          </div>
        </div>
      </footer>
    </div>
  )
}
