import { PulseLoader } from 'react-spinners'

export default function LoadingPlayers() {
  return (
    <p className="flex justify-center items-center gap-2 text-gray-700 text-xl py-4">
      Loading players
      <PulseLoader color="black" size={6} />
    </p>
  )
}
