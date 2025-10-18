import AuthRedirect from './components/features/auth/AuthRedirect'

export const metadata = {
  title: 'Loons Team Balancer',
  description: 'Loons Team Balancer - Authenticating...',
}

export default function HomePage() {
  return <AuthRedirect />
}
