import localFont from 'next/font/local'
import '../../styles/globals.css'
import ClientLayout from './ClientLayout'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata = {
  title: 'Loons Team Balancer',
  description: 'Loons Team Balancer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
