function balanceTeams(players, numTeams) {
  // Validate input
  if (!players || !Array.isArray(players)) {
    console.error('Invalid players data:', players)
    throw new Error('Invalid players data')
  }
  if (!numTeams || numTeams < 2) {
    console.error('Invalid number of teams:', numTeams)
    throw new Error('Invalid number of teams')
  }

  // Log the input data
  console.log('Processing teams with:', {
    numTeams,
    playerCount: players.length,
    firstPlayer: players[0],
  })

  // Ensure all required player properties exist and are of correct type
  const validPlayers = players.filter(player => {
    // Convert all numeric fields to numbers
    const gameKnowledgeScore = Number(player.gameKnowledgeScore)
    const goalScoringScore = Number(player.goalScoringScore)
    const attackScore = Number(player.attackScore)
    const midfieldScore = Number(player.midfieldScore)
    const defenseScore = Number(player.defenseScore)
    const fitnessScore = Number(player.fitnessScore)

    // Check if any numeric fields are NaN
    if (
      isNaN(gameKnowledgeScore) ||
      isNaN(goalScoringScore) ||
      isNaN(attackScore) ||
      isNaN(midfieldScore) ||
      isNaN(defenseScore) ||
      isNaN(fitnessScore)
    ) {
      console.warn('Player has invalid numeric scores:', {
        player,
        scores: {
          gameKnowledgeScore,
          goalScoringScore,
          attackScore,
          midfieldScore,
          defenseScore,
          fitnessScore,
        },
      })
      return false
    }

    // Check if gender is valid
    if (!['male', 'female', 'nonBinary'].includes(player.gender)) {
      console.warn('Player has invalid gender:', {
        player,
        gender: player.gender,
      })
      return false
    }

    return true
  })

  if (validPlayers.length === 0) {
    console.error('No valid players provided')
    throw new Error('No valid players provided')
  }

  const playersThisWeek = validPlayers.filter(
    player => player.isPlayingThisWeek
  )
  const totalPlayersPlaying = playersThisWeek.length

  if (totalPlayersPlaying === 0) {
    console.error('No players selected for this week')
    throw new Error('No players selected for this week')
  }

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
    // Ensure all scores are numbers
    const gameKnowledgeScore = Number(player.gameKnowledgeScore)
    const goalScoringScore = Number(player.goalScoringScore)
    const attackScore = Number(player.attackScore)
    const midfieldScore = Number(player.midfieldScore)
    const defenseScore = Number(player.defenseScore)
    const fitnessScore = Number(player.fitnessScore)

    player.totalScore =
      fudge(gameKnowledgeScore) * WEIGHTS.gameKnowledge +
      fudge(goalScoringScore) * WEIGHTS.goalScoring +
      fudge(attackScore) * WEIGHTS.attack +
      fudge(midfieldScore) * WEIGHTS.midfield +
      fudge(defenseScore) * WEIGHTS.defense +
      fudge(fitnessScore) * WEIGHTS.fitness
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
    team.totalGameKnowledgeScore += Number(player.gameKnowledgeScore)
    team.totalGoalScoringScore += Number(player.goalScoringScore)
    team.totalAttackScore += Number(player.attackScore)
    team.totalMidfieldScore += Number(player.midfieldScore)
    team.totalDefenseScore += Number(player.defenseScore)
    team.fitnessScore += Number(player.fitnessScore)
    team.genderCount[player.gender]++
  }

  // Calculate final team stats
  const finalTeams = teams.map(team => ({
    ...team,
    totalScore: Number(team.totalScore.toFixed(2)),
    totalGameKnowledgeScore: Number(team.totalGameKnowledgeScore.toFixed(2)),
    totalGoalScoringScore: Number(team.totalGoalScoringScore.toFixed(2)),
    totalAttackScore: Number(team.totalAttackScore.toFixed(2)),
    totalMidfieldScore: Number(team.totalMidfieldScore.toFixed(2)),
    totalDefenseScore: Number(team.totalDefenseScore.toFixed(2)),
    fitnessScore: Number(team.fitnessScore.toFixed(2)),
  }))

  // Log the final teams for debugging
  console.log('Final teams:', {
    teamCount: finalTeams.length,
    totalPlayers: totalPlayersPlaying,
    firstTeam: finalTeams[0],
  })

  return { teams: finalTeams, totalPlayersPlaying }
}

export default balanceTeams
