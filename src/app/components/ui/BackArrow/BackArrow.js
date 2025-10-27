import Image from 'next/image'
import backArrow from '../../../../../public/back-curved-arrow-svgrepo-com.svg'

export const BackArrow = ({ classes }) => {
  return (
    <Image
      src={backArrow}
      alt="Back arrow image"
      className={`${classes}`}
      height={16}
      width={16}
    />
  )
}
