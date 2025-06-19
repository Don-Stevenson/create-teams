// Add weights at the top of the file
const WEIGHTS = {
  gameKnowledge: 0.2,
  goalScoring: 0.2,
  attack: 0.135,
  midfield: 0.133,
  defense: 0.133,
  fitness: 0.1,
}

// Helper function to calculate weighted player score
const calculatePlayerScore = player => {
  return (
    player.gameKnowledgeScore * WEIGHTS.gameKnowledge +
    player.goalScoringScore * WEIGHTS.goalScoring +
    player.attackScore * WEIGHTS.attack +
    player.midfieldScore * WEIGHTS.midfield +
    player.defenseScore * WEIGHTS.defense +
    player.fitnessScore * WEIGHTS.fitness
  )
}

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

    // Check if isPlayingThisWeek is true (handle both boolean and string values)
    const isPlaying =
      player.isPlayingThisWeek === true ||
      player.isPlayingThisWeek === 'true' ||
      player.isPlayingThisWeek === 1 ||
      player.isPlayingThisWeek === '1'
    if (!isPlaying) {
      console.warn('Player is not marked as playing this week:', {
        player,
        isPlayingThisWeek: player.isPlayingThisWeek,
        type: typeof player.isPlayingThisWeek,
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

    return true
  })

  if (validPlayers.length === 0) {
    throw new Error('No valid players provided')
  }

  // Sort players by total score
  const sortedPlayers = validPlayers.sort((a, b) => {
    const aTotal = calculatePlayerScore(a)
    const bTotal = calculatePlayerScore(b)
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
    targetTeam.totalScore += calculatePlayerScore(player)
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

  return { teams: finalTeams, totalPlayersPlaying: validPlayers.length }
}

export default balanceTeams
