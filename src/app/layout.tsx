import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DNCL IMEI Lookup',
  description: 'IMEI and Serial Number device lookup with Phonecheck and ICE Q APIs',
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
