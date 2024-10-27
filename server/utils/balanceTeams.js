function balanceTeams(players, numTeams) {
  const playersThisWeek = [
    ...players.filter(player => player.isPlayingThisWeek),
  ]

  const totalPlayersPlaying = playersThisWeek.length

  const teams = Array.from({ length: numTeams }, () => ({
    players: [],
    totalScore: 0,
    totalGameKnowledgeScore: 0,
    totalGoalScoringScore: 0,
    totalAttackScore: 0,
    totalMidfieldScore: 0,
    totalAttackScore: 0,
    totalDefenseScore: 0,
    fitnessScore: 0,
    genderCount: { male: 0, female: 0, nonBinary: 0 },
  }))

  playersThisWeek.sort((a, b) => {
    if (a.gender !== b.gender) return a.gender.localeCompare(b.gender)
    return (
      b.gameKnowledgeScore +
      b.goalScoringScore +
      b.attackScore +
      b.midfieldScore +
      b.defenseScore +
      b.fitnessScore -
      (b.gameKnowledgeScore +
        b.goalScoringScore +
        b.attackScore +
        b.midfieldScore +
        b.defenseScore +
        b.fitnessScore)
    )
  })

  // Distribute players using a modified serpentine draft method
  for (let i = 0; i < playersThisWeek.length; i++) {
    const player = playersThisWeek[i]
    let teamIndex

    const WEIGHTS = {
      gameKnowledge: 0.2,
      goalScoring: 0.2,
      attack: 0.135,
      midfield: 0.133,
      defense: 0.133,
      fitness: 0.1,
    }

    // add a small amount of noise to help make the teams are not identical each time
    const fudge = score => Math.random() * 0.3 + score - 0.15

    // Calculate player's weighted total score
    player.totalScore =
      fudge(player.gameKnowledgeScore) * WEIGHTS.gameKnowledge +
      fudge(player.goalScoringScore) * WEIGHTS.goalScoring +
      fudge(player.attackScore) * WEIGHTS.attack +
      fudge(player.midfieldScore) * WEIGHTS.midfield +
      fudge(player.defenseScore) * WEIGHTS.defense +
      fudge(player.fitnessScore) * WEIGHTS.fitness

    // Get minimum and maximum team sizes currently
    const minTeamSize = Math.min(...teams.map(t => t.players.length))
    const maxTeamSize = Math.max(...teams.map(t => t.players.length))

    // Find teams that can receive players (lowest size, or lowest size + 1 if necessary)
    let eligibleTeams = teams.filter(
      team => team.players.length === minTeamSize
    )

    // If no teams at minimum size, allow teams at minimum size + 1
    // but only if that wouldn't create more than 1 player difference
    if (eligibleTeams.length === 0 && maxTeamSize - minTeamSize <= 1) {
      eligibleTeams = teams.filter(
        team => team.players.length === minTeamSize + 1
      )
    }

    // Among eligible teams, find the one with lowest total score
    teamIndex = eligibleTeams.reduce(
      (minIndex, team, index, arr) =>
        team.totalScore < arr[minIndex].totalScore ? index : minIndex,
      0
    )

    // Get the index in the original teams array
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

    // Validation logging
    // if (i === playersThisWeek.length - 1) {
    //   const teamSizes = teams.map(t => t.players.length)
    //   const finalMaxSize = Math.max(...teamSizes)
    //   const finalMinSize = Math.min(...teamSizes)
    //   console.log(`Final team sizes: ${teamSizes.join(', ')}`)
    //   console.log(`Team size difference: ${finalMaxSize - finalMinSize}`)
    //   console.log(
    //     `Team scores: ${teams.map(t => t.totalScore.toFixed(2)).join(', ')}`
    //   )
    // }
  }

  return { teams, totalPlayersPlaying }
}
export default balanceTeams
