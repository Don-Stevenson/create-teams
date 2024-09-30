// pages/balance-teams.js
import Layout from '../src/app/components/Layout.js'
import CreateTeams from '../src/app/components/CreateTeams.js'

export default function BalanceTeamsPage() {
  return (
    <Layout>
      <div className="flex-col mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-600">Create Teams</h1>
        <CreateTeams />
      </div>
    </Layout>
  )
}
