function balanceTeams(players, numTeams) {
  const playersThisWeek = [
    ...players.filter(player => player.isPlayingThisWeek),
  ]

  const teams = Array.from({ length: numTeams }, () => ({
    players: [],
    totalScore: 0,
    totalAttackScore: 0,
    totalDefenseScore: 0,
    fitnessScore: 0,
    genderCount: { male: 0, female: 0, nonBinary: 0 },
  }))

  playersThisWeek.sort((a, b) => {
    if (a.gender !== b.gender) return a.gender.localeCompare(b.gender)
    return (
      b.attackScore +
      b.defenseScore +
      b.fitnessScore -
      (a.attackScore + a.defenseScore + a.fitnessScore)
    )
  })

  // Distribute players using a modified serpentine draft method
  for (let i = 0; i < playersThisWeek.length; i++) {
    const player = playersThisWeek[i]
    let teamIndex

    // find the team with the lowest total score
    teamIndex = teams.reduce(
      (minIndex, team, index, arr) =>
        team.totalScore < arr[minIndex].totalScore ? index : minIndex,
      0
    )

    const team = teams[teamIndex]
    // add a small amount of noise to help make the teams are not identical each time when calculating the team score
    const fudge = score => Math.random() * 4 + score - 2

    // Calculate player's weighted total score
    player.totalScore =
      fudge(player.attackScore) * 0.4 +
      fudge(player.defenseScore) * 0.4 +
      fudge(player.fitnessScore) * 0.2

    team.players.push(player)
    team.totalScore += player.totalScore
    team.totalAttackScore += player.attackScore
    team.totalDefenseScore += player.defenseScore
    team.fitnessScore += player.fitnessScore
    team.genderCount[player.gender]++
  }
  return teams
}

export default balanceTeams
