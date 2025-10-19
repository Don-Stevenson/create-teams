import Link from 'next/link'

export default function Footer() {
  return (
    <div className="flex flex-col justify-center items-center text-xs p-4 print:hidden">
      <Link
        href={'/about'}
        className="flex justify-center text-center items-center text-xs text-loonsRed h-8 uppercase hover:cursor-pointer hover:text-[#f38686] transition-colors duration-300 font-bold"
      >
        Learn more about Loons Team Balancer
      </Link>
      <p>
        © {new Date(Date.now()).getFullYear().toString()} Loons Team Balancer.
        All rights reserved.
      </p>
    </div>
  )
}
