const LetterIndex = ({ player, shownInitials, setShownInitials }) => {
  const getFirstNameInitial = name => {
    return name.split(' ')[0][0].toUpperCase()
  }

  const firstInitial = getFirstNameInitial(player.name)

  if (!shownInitials.has(firstInitial)) {
    setShownInitials(firstInitial)
    return <div className="text-3xl font-bold text-red-700">{firstInitial}</div>
  }

  return null
}

export default LetterIndex
