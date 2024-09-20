// components/Layout.js
import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Loons Team Balancer App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="bg-red-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Team Balancer</h1>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
