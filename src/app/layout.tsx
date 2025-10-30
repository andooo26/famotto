import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/AuthContext"

export const metadata: Metadata = {
  title: "Famotto",
  description: "Famotto",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
