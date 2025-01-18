import Head from 'next/head'
import NavBar from './NavBar'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen print:m-0">
      <Head>
        <title>Loons Team Balancer App</title>
        <link rel="icon" href="/TWSC_Badge.webp" type="image/webp" />
      </Head>
      <NavBar />
      <main className="flex-grow">{children}</main>
      <div className="text-center items-center text-xs p-4 print:hidden">
        © {new Date(Date.now()).getFullYear().toString()} Loons Team Balancer.
        All rights reserved.
      </div>
    </div>
  )
}
