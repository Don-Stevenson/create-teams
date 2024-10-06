const config = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://loons-team-balancer.onrender.com',
}
console.log('baseUrl,', config.apiUrl)

export default config
