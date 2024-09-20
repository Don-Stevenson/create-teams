function shuffleArray(array) {
  // Fisher-Yates Shuffle to randomize player order
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function balanceTeams(players, numTeams) {
  const playersPerTeam = Math.floor(players.length / numTeams)
  const extraPlayers = players.length % numTeams

  const teams = Array.from({ length: numTeams }, () => ({
    players: [],
    totalScore: 0,
    totalAttackScore: 0,
    totalDefenseScore: 0,
    attackerCount: 0,
    defenderCount: 0,
    fitnessScore: 0,
    genderCount: { male: 0, female: 0 },
  }))

  // Shuffle players to ensure variety week-to-week
  const shuffledPlayers = shuffleArray(players)

  // Sort players based on their roles (attackers/defenders)
  const attackers = shuffledPlayers.filter(
    player => player.attackScore > player.defenseScore
  )
  const defenders = shuffledPlayers.filter(
    player => player.defenseScore >= player.attackScore
  )

  // Combine players again for shuffling while maintaining balance
  const combinedPlayers = [...attackers, ...defenders]

  // Split players into male and female for gender balancing
  const males = combinedPlayers.filter(player => player.gender === 'male')
  const females = combinedPlayers.filter(player => player.gender === 'female')

  // Function to find the team that needs a player based on attack/defense balance
  function getBalancedTeam(isAttacker) {
    return teams.reduce(
      (acc, team) => {
        const attackDeficit = team.totalDefenseScore - team.totalAttackScore
        const defenseDeficit = team.totalAttackScore - team.totalDefenseScore
        if (isAttacker && attackDeficit > acc.deficit) {
          return { team, deficit: attackDeficit }
        } else if (!isAttacker && defenseDeficit > acc.deficit) {
          return { team, deficit: defenseDeficit }
        }
        return acc
      },
      { team: teams[0], deficit: Infinity }
    ).team
  }

  // Loop over teams and assign players, balancing gender, roles, and attack/defense scores
  for (let i = 0; i < players.length; i++) {
    // Determine whether to assign an attacker or defender next based on balance
    const isAttackerTurn = i % 2 === 0 ? true : false
    let player = null

    // Pick player based on gender and role
    if (isAttackerTurn) {
      player = attackers.shift()
    } else {
      player = defenders.shift()
    }

    // If no more attackers/defenders are available, continue with remaining players
    if (!player) {
      player = combinedPlayers.shift()
    }

    // Find the best team to balance attack/defense
    const team = getBalancedTeam(isAttackerTurn)

    // Calculate total player score considering attack, defense, and fitness
    const weightedTotalScore =
      player.attackScore * 0.4 +
      player.defenseScore * 0.4 +
      player.fitnessScore * 0.2
    player.totalScore = weightedTotalScore

    // Assign player to the team
    team.players.push(player)
    team.totalScore += player.totalScore
    team.fitnessScore += player.fitnessScore
    team.genderCount[player.gender]++

    // Update attack/defense counts and scores
    if (player.attackScore > player.defenseScore) {
      team.attackerCount++
      team.totalAttackScore += player.attackScore
    } else {
      team.defenderCount++
      team.totalDefenseScore += player.defenseScore
    }
  }

  // Adjust teams for extra players (if the number of players isn't perfectly divisible by teams)
  for (let i = 0; i < extraPlayers; i++) {
    const team = teams[i]
    const player = combinedPlayers.pop() // Add the extra players to the first few teams
    team.players.push(player)
    team.totalScore += player.totalScore
    team.fitnessScore += player.fitnessScore
    team.genderCount[player.gender]++
    if (player.attackScore > player.defenseScore) {
      team.attackerCount++
      team.totalAttackScore += player.attackScore
    } else {
      team.defenderCount++
      team.totalDefenseScore += player.defenseScore
    }
  }

  // Print out the details of each team
  teams.forEach((team, index) => {
    console.log(`\nTeam ${index + 1}:`)
    console.log(
      `Total Score: ${team.totalScore.toFixed(
        2
      )}, Fitness Score: ${team.fitnessScore.toFixed(2)}`
    )
    console.log(
      `Total Attack: ${team.totalAttackScore.toFixed(
        2
      )}, Total Defense: ${team.totalDefenseScore.toFixed(2)}`
    )
    console.log(
      `Males: ${team.genderCount.male}, Females: ${team.genderCount.female}`
    )

    // Sort players by total score before printing
    team.players.sort((a, b) => b.totalScore - a.totalScore)

    team.players.forEach(player => {
      console.log(
        `${player.name} - Attack: ${player.attackScore}, Defense: ${
          player.defenseScore
        }, Fitness: ${player.fitnessScore}, Total: ${player.totalScore.toFixed(
          2
        )}`
      )
    })
  })
  return teams
}

export default balanceTeams
