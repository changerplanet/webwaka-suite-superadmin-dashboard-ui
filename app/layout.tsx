import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WebWaka Super Admin Dashboard',
  description: 'Declarative, Controlled, Minimal Dashboard UI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
