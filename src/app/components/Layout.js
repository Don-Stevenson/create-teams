import Head from 'next/head'
import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Loons Team Balancer App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="flex justify-between bg-red-600 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Loons Team Balancer</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white border border-red-400 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
          >
            Create Teams
          </Link>
          <Link
            href="/players"
            className="bg-red-600 hover:bg-red-700 text-white border border-red-400 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
          >
            Manage Players
          </Link>
          <Link
            href="/about"
            className="bg-red-600 hover:bg-red-700 text-white border border-red-400 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
          >
            About
          </Link>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
    </div>
  )
}
