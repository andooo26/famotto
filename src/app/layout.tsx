import type { Metadata } from "next"
import './globals.css';  
import { AuthProvider } from "@/contexts/AuthContext"
import { Poppins } from 'next/font/google'

import './globals.css'; //追記

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

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
      <body className={poppins.className} style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
