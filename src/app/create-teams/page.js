'use client'

import CreateTeams from '../components/CreateTeams'
import withAuth from '../components/withAuth'

function CreateTeamsPage() {
  return <CreateTeams />
}

export default withAuth(CreateTeamsPage)
