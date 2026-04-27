import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'ReliefSync AI – Crisis Coordination System',
  description: 'AI-powered real-time crisis coordination platform for tactical intelligence and responder deployment.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  )
}
