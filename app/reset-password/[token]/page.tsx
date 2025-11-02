import React from "react"
import { ResetPassword } from "@/components/auth/reset-password"

interface PageProps {
  params: { token: string }
}

export default function Page({ params }: PageProps) {
  const { token } = params
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {/* token passed to client component */}
      {/* @ts-ignore - passing token to client component */}
      <ResetPassword token={token} />
    </main>
  )
}
