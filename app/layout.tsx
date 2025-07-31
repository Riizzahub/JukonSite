import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Jukon Beam - Digital Dimension Portal",
  description: "Welcome to beaming community through interactive cyber portals with immersive audio-visual experience",
  keywords: "jukon, beam, digital, dashboard, interactive, music, visualization, beaming, community",
  authors: [{ name: "Jukon Beam Team" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/placeholder.mp3" as="audio" type="audio/mpeg" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
