import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/AuthContext"

import './globals.css'; //追記

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
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
