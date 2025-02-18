// Next.js API route for logout
// localhost:3000/api/users/logout
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Clear the authentication cookie
  res.setHeader(
    'Set-Cookie',
    'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  )

  return res.status(200).json({ success: true })
}
