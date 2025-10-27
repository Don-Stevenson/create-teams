import LoonsBadge from '../../../assets/img/TWSC.webp'
import Image from 'next/image'

export const Logo = ({ classes }) => {
  return (
    <div className={`${classes} flex flex-col items-center`}>
      <div className="relative z-10 w-[6.25rem] h-[7.8125rem] top-[1.25rem]">
        <Image
          src={LoonsBadge}
          width={100}
          height={120.24}
          alt="Toronto Walking Soccer Loons Club Logo"
          priority
        />
      </div>
      <div className="flex bg-loonsDarkBrown z-0 w-[17.8125rem] justify-center h-[4.375rem] items-center mb-4">
        <div className="flex items-center justify-center text-2xl border-[0.3125rem] border-loonsRed bg-loonsBrown w-[17.3125rem] text-loonsBeige text-center h-[3.875rem] z-10 font-oswald font-[400] uppercase tracking-wider">
          Loons Team Balancer
        </div>
      </div>
    </div>
  )
}
