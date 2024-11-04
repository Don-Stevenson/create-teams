function balanceTeams(players, numTeams) {
  const playersThisWeek = players.filter(player => player.isPlayingThisWeek)

  const totalPlayersPlaying = playersThisWeek.length

  const teams = Array.from({ length: numTeams }, () => ({
    players: [],
    totalScore: 0,
    totalGameKnowledgeScore: 0,
    totalGoalScoringScore: 0,
    totalAttackScore: 0,
    totalMidfieldScore: 0,
    totalDefenseScore: 0,
    fitnessScore: 0,
    genderCount: { male: 0, female: 0, nonBinary: 0 },
  }))

  const WEIGHTS = {
    gameKnowledge: 0.2,
    goalScoring: 0.2,
    attack: 0.135,
    midfield: 0.133,
    defense: 0.133,
    fitness: 0.1,
  }

  const fudge = score => score + (Math.random() - 0.5) * 1.4

  playersThisWeek.forEach(player => {
    player.totalScore =
      fudge(player.gameKnowledgeScore) * WEIGHTS.gameKnowledge +
      fudge(player.goalScoringScore) * WEIGHTS.goalScoring +
      fudge(player.attackScore) * WEIGHTS.attack +
      fudge(player.midfieldScore) * WEIGHTS.midfield +
      fudge(player.defenseScore) * WEIGHTS.defense +
      fudge(player.fitnessScore) * WEIGHTS.fitness
  })

  // Separate players by gender to distribute women and non-binary first
  const femaleAndNonBinaryPlayers = playersThisWeek.filter(player =>
    ['female', 'nonBinary'].includes(player.gender)
  )
  const malePlayers = playersThisWeek.filter(player => player.gender === 'male')

  // Sort each group by total score in descending order
  femaleAndNonBinaryPlayers.sort((a, b) => b.totalScore - a.totalScore)
  malePlayers.sort((a, b) => b.totalScore - a.totalScore)

  // Combine lists so female and non-binary players are added first
  const sortedPlayers = [...femaleAndNonBinaryPlayers, ...malePlayers]

  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i]
    let teamIndex

    const eligibleTeams = teams.filter(
      team =>
        team.players.length === Math.min(...teams.map(t => t.players.length))
    )

    teamIndex = eligibleTeams.reduce(
      (minIndex, team, index, arr) =>
        team.totalScore < arr[minIndex].totalScore ? index : minIndex,
      0
    )

    teamIndex = teams.findIndex(team => team === eligibleTeams[teamIndex])
    const team = teams[teamIndex]

    team.players.push(player)
    team.totalScore += player.totalScore
    team.totalGameKnowledgeScore += player.gameKnowledgeScore
    team.totalGoalScoringScore += player.goalScoringScore
    team.totalAttackScore += player.attackScore
    team.totalMidfieldScore += player.midfieldScore
    team.totalDefenseScore += player.defenseScore
    team.fitnessScore += player.fitnessScore
    team.genderCount[player.gender]++
  }

  return { teams, totalPlayersPlaying }
}

export default balanceTeams
