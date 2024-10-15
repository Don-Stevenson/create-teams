import Head from 'next/head'
import Link from 'next/link'
import Logout from './Logout'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen print:m-0">
      <Head>
        <title>Loons Team Balancer App</title>
        <link rel="icon" href="/TWSC_Badge.webp" type="image/webp" />
      </Head>
      <div className="flex z-0 bg-loonsDarkBrown items-center justify-center min-w-[382px]">
        <nav className="flex justify-between border-[5px] m-2 w-full border-loonsRed rounded bg-loonsBrown text-loonsBeige p-4 print:hidden items-center">
          <div className="flex bg-loonsRed text-loonsBeige border border-red-900 font-semibold py-1 px-2 md:w-[350px] rounded text-center md:h-[45px] justify-center items-center mr-2 ">
            <h1 className="text-2xl font-bold">Loons Team Balancer</h1>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/"
              className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
            >
              Create Teams
            </Link>
            <Link
              href="/players"
              className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
            >
              Manage Players
            </Link>
            <Link
              href="/about"
              className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900  font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
            >
              About
            </Link>
            <Logout />
          </div>
        </nav>
      </div>
      <main className="flex-grow">{children}</main>
      <div className="text-center items-center text-xs p-4 print:hidden">
        © {new Date(Date.now()).getFullYear().toString()} Loons Team Balancer.
        All rights reserved.
      </div>
    </div>
  )
}
