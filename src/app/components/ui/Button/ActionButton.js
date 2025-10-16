export const ActionButton = ({
  onClick,
  variant = 'default',
  children,
  testId,
}) => {
  const baseStyles =
    'flex items-center justify-center text-[0.62rem] font-medium p-[0.15rem] rounded h-[2.5rem] w-[2.50rem]'

  let variantStyles = 'border border-gray-300 text-black' // default style

  if (variant === 'delete') {
    variantStyles =
      'bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900'
  } else if (variant === 'edit') {
    variantStyles =
      'bg-white hover:bg-gray-200 text-black border border-gray-300'
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles}`}
      data-testid={testId}
    >
      {children}
    </button>
  )
}
