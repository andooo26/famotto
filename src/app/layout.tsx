import type { Metadata } from "next"
import './diary/tailwind.css';
// import './globals.css';  

export const metadata: Metadata = {
  title: "Famotto",
  description: "Famotto application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}
