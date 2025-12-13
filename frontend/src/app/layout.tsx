import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rede Baiana - Simulador de Infraestrutura de Rede',
  description: 'Simulador de rede de computadores com visualização interativa de grafos',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}

