function balanceTeams(players, numTeams) {
  console.log('=== BALANCE TEAMS FUNCTION INPUT ===')
  console.log('Players input:', players)
  console.log('Players type:', typeof players)
  console.log('Is players array?', Array.isArray(players))
  console.log('Number of teams:', numTeams)
  console.log('Number of teams type:', typeof numTeams)
  console.log('===================================')

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
  console.log('=== PROCESSING TEAMS DATA ===')
  console.log('Number of teams:', numTeams)
  console.log('Player count:', players.length)
  console.log('First player:', players[0])
  console.log('============================')

  // Ensure all required player properties exist and are of correct type
  const validPlayers = players.filter(player => {
    console.log('=== VALIDATING PLAYER ===')
    console.log('Player being validated:', player)

    // Convert all numeric fields to numbers
    const gameKnowledgeScore = Number(player.gameKnowledgeScore)
    const goalScoringScore = Number(player.goalScoringScore)
    const attackScore = Number(player.attackScore)
    const midfieldScore = Number(player.midfieldScore)
    const defenseScore = Number(player.defenseScore)
    const fitnessScore = Number(player.fitnessScore)

    console.log('Converted scores:', {
      gameKnowledgeScore,
      goalScoringScore,
      attackScore,
      midfieldScore,
      defenseScore,
      fitnessScore,
    })

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

    // Check if isPlayingThisWeek is true
    if (player.isPlayingThisWeek !== true) {
      console.warn('Player is not marked as playing this week:', {
        player,
        isPlayingThisWeek: player.isPlayingThisWeek,
      })
      return false
    }

    // Create a clean player object with all required fields
    const cleanPlayer = {
      name: player.name,
      gameKnowledgeScore,
      goalScoringScore,
      attackScore,
      midfieldScore,
      defenseScore,
      fitnessScore,
      gender: player.gender,
      isPlayingThisWeek: true,
    }

    // Update the original player object with cleaned values
    Object.assign(player, cleanPlayer)

    console.log('Player validation passed')
    console.log('========================')
    return true
  })

  // Log validation results
  console.log('=== VALIDATION RESULTS ===')
  console.log('Total players:', players.length)
  console.log('Valid players:', validPlayers.length)
  console.log('=========================')

  if (validPlayers.length === 0) {
    throw new Error('No valid players provided')
  }

  // Sort players by total score
  const sortedPlayers = validPlayers.sort((a, b) => {
    const aTotal =
      a.gameKnowledgeScore +
      a.goalScoringScore +
      a.attackScore +
      a.midfieldScore +
      a.defenseScore +
      a.fitnessScore
    const bTotal =
      b.gameKnowledgeScore +
      b.goalScoringScore +
      b.attackScore +
      b.midfieldScore +
      b.defenseScore +
      b.fitnessScore
    return bTotal - aTotal
  })

  // Initialize teams
  const teams = Array.from({ length: numTeams }, () => ({
    players: [],
    totalScore: 0,
    totalGameKnowledgeScore: 0,
    totalGoalScoringScore: 0,
    totalAttackScore: 0,
    totalMidfieldScore: 0,
    totalDefenseScore: 0,
    fitnessScore: 0,
    genderCount: {
      male: 0,
      female: 0,
      nonBinary: 0,
    },
  }))

  // Distribute players to teams
  sortedPlayers.forEach(player => {
    // Find the team with the lowest total score
    const targetTeam = teams.reduce((min, team) =>
      team.totalScore < min.totalScore ? team : min
    )

    // Add player to the team
    targetTeam.players.push(player)
    targetTeam.totalScore +=
      player.gameKnowledgeScore +
      player.goalScoringScore +
      player.attackScore +
      player.midfieldScore +
      player.defenseScore +
      player.fitnessScore
    targetTeam.totalGameKnowledgeScore += player.gameKnowledgeScore
    targetTeam.totalGoalScoringScore += player.goalScoringScore
    targetTeam.totalAttackScore += player.attackScore
    targetTeam.totalMidfieldScore += player.midfieldScore
    targetTeam.totalDefenseScore += player.defenseScore
    targetTeam.fitnessScore += player.fitnessScore
    targetTeam.genderCount[player.gender]++
  })

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
    genderCount: {
      male: team.genderCount.male,
      female: team.genderCount.female,
      nonBinary: team.genderCount.nonBinary,
    },
  }))

  // Log the final teams for debugging
  console.log('Final teams:', {
    teamCount: finalTeams.length,
    totalPlayers: validPlayers.length,
    firstTeam: finalTeams[0],
  })

  return { teams: finalTeams, totalPlayersPlaying: validPlayers.length }
}

export default balanceTeams
