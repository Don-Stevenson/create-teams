// pages/index.js
'use-client'

import Link from 'next/link'
import Layout from '../src/app/components/Layout.js'

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-8 text-red-600">
          Team Balancer App
        </h1>
        <div className="flex space-x-4">
          <Link
            href="/players"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Players
          </Link>
          <Link
            href="/create-teams"
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
          >
            Create Teams
          </Link>
        </div>
      </div>
    </Layout>
  )
}
