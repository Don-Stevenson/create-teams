import Layout from '../src/app/components/Layout.js'
import CreateTeams from '../src/app/components/CreateTeams.js'
import withAuth from '@/app/components/withAuth.js'

function BalanceTeamsPage() {
  return (
    <Layout>
      <div className="flex-col mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-loonsRed print:hidden">
          Create Teams
        </h1>
        <CreateTeams />
      </div>
    </Layout>
  )
}

export default withAuth(BalanceTeamsPage)
