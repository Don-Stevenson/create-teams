'use client'

import CreateTeams from '../components/ui/Teams/CreateTeams'
import withAuth from '../components/features/auth/withAuthWrapper'

function CreateTeamsPage() {
  return <CreateTeams />
}

export default withAuth(CreateTeamsPage)
