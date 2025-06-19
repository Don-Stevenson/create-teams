import balanceTeams from './balanceTeams.js'

describe('balanceTeams Algorithm', () => {
  const mockPlayers = [
    {
      name: 'Strong Player',
      gameKnowledgeScore: 90,
      goalScoringScore: 85,
      attackScore: 90,
      midfieldScore: 80,
      defenseScore: 85,
      fitnessScore: 95,
      gender: 'male',
      isPlayingThisWeek: true,
    },
    {
      name: 'Weak Player',
      gameKnowledgeScore: 40,
      goalScoringScore: 30,
      attackScore: 35,
      midfieldScore: 25,
      defenseScore: 30,
      fitnessScore: 35,
      gender: 'female',
      isPlayingThisWeek: true,
    },
    {
      name: 'Average Player 1',
      gameKnowledgeScore: 65,
      goalScoringScore: 60,
      attackScore: 65,
      midfieldScore: 55,
      defenseScore: 60,
      fitnessScore: 70,
      gender: 'male',
      isPlayingThisWeek: true,
    },
    {
      name: 'Average Player 2',
      gameKnowledgeScore: 70,
      goalScoringScore: 65,
      attackScore: 60,
      midfieldScore: 70,
      defenseScore: 65,
      fitnessScore: 65,
      gender: 'female',
      isPlayingThisWeek: true,
    },
  ]

  describe('Input Validation', () => {
    it('should throw error for invalid players data', () => {
      expect(() => balanceTeams(null, 2)).toThrow('Invalid players data')
      expect(() => balanceTeams(undefined, 2)).toThrow('Invalid players data')
      expect(() => balanceTeams('invalid', 2)).toThrow('Invalid players data')
      expect(() => balanceTeams({}, 2)).toThrow('Invalid players data')
    })

    it('should throw error for invalid number of teams', () => {
      expect(() => balanceTeams(mockPlayers, null)).toThrow(
        'Invalid number of teams'
      )
      expect(() => balanceTeams(mockPlayers, undefined)).toThrow(
        'Invalid number of teams'
      )
      expect(() => balanceTeams(mockPlayers, 0)).toThrow(
        'Invalid number of teams'
      )
      expect(() => balanceTeams(mockPlayers, 1)).toThrow(
        'Invalid number of teams'
      )
      expect(() => balanceTeams(mockPlayers, -1)).toThrow(
        'Invalid number of teams'
      )
    })

    it('should throw error when no valid players provided', () => {
      const invalidPlayers = [
        { name: 'Invalid Player', isPlayingThisWeek: false },
      ]
      expect(() => balanceTeams(invalidPlayers, 2)).toThrow(
        'No valid players provided'
      )
    })

    it('should filter out players with invalid scores', () => {
      const playersWithInvalidScores = [
        ...mockPlayers,
        {
          name: 'Invalid Score Player',
          gameKnowledgeScore: 'invalid',
          goalScoringScore: null,
          attackScore: undefined,
          midfieldScore: 50,
          defenseScore: 50,
          fitnessScore: 50,
          gender: 'male',
          isPlayingThisWeek: true,
        },
      ]

      const result = balanceTeams(playersWithInvalidScores, 2)
      expect(result.totalPlayersPlaying).toBe(4) // Only the valid players
    })

    it('should filter out players with invalid gender', () => {
      const playersWithInvalidGender = [
        ...mockPlayers,
        {
          name: 'Invalid Gender Player',
          gameKnowledgeScore: 50,
          goalScoringScore: 50,
          attackScore: 50,
          midfieldScore: 50,
          defenseScore: 50,
          fitnessScore: 50,
          gender: 'invalid',
          isPlayingThisWeek: true,
        },
      ]

      const result = balanceTeams(playersWithInvalidGender, 2)
      expect(result.totalPlayersPlaying).toBe(4) // Only the valid players
    })

    it('should filter out players not playing this week', () => {
      const playersWithNotPlaying = [
        ...mockPlayers,
        {
          name: 'Not Playing Player',
          gameKnowledgeScore: 50,
          goalScoringScore: 50,
          attackScore: 50,
          midfieldScore: 50,
          defenseScore: 50,
          fitnessScore: 50,
          gender: 'male',
          isPlayingThisWeek: false,
        },
      ]

      const result = balanceTeams(playersWithNotPlaying, 2)
      expect(result.totalPlayersPlaying).toBe(4) // Only the playing players
    })

    it('should handle different formats of isPlayingThisWeek', () => {
      const playersWithDifferentFormats = [
        { ...mockPlayers[0], isPlayingThisWeek: true },
        { ...mockPlayers[1], isPlayingThisWeek: 'true' },
        { ...mockPlayers[2], isPlayingThisWeek: 1 },
        { ...mockPlayers[3], isPlayingThisWeek: '1' },
      ]

      const result = balanceTeams(playersWithDifferentFormats, 2)
      expect(result.totalPlayersPlaying).toBe(4)
    })
  })

  describe('Team Distribution', () => {
    it('should create the correct number of teams', () => {
      const result = balanceTeams(mockPlayers, 2)
      expect(result.teams).toHaveLength(2)

      const result3Teams = balanceTeams(mockPlayers, 3)
      expect(result3Teams.teams).toHaveLength(3)
    })

    it('should distribute players among teams', () => {
      const result = balanceTeams(mockPlayers, 2)
      const totalPlayersInTeams = result.teams.reduce(
        (sum, team) => sum + team.players.length,
        0
      )
      expect(totalPlayersInTeams).toBe(mockPlayers.length)
    })

    it('should balance team sizes as evenly as possible', () => {
      const result = balanceTeams(mockPlayers, 2)
      const teamSizes = result.teams.map(team => team.players.length)
      const maxSize = Math.max(...teamSizes)
      const minSize = Math.min(...teamSizes)

      // Team sizes should differ by at most 1
      expect(maxSize - minSize).toBeLessThanOrEqual(1)
    })

    it('should handle odd number of players', () => {
      const oddPlayers = mockPlayers.slice(0, 3)
      const result = balanceTeams(oddPlayers, 2)

      const teamSizes = result.teams.map(team => team.players.length)
      expect(teamSizes.sort()).toEqual([1, 2])
    })
  })

  describe('Score Balancing', () => {
    it('should attempt to balance total scores between teams', () => {
      const result = balanceTeams(mockPlayers, 2)

      const teamScores = result.teams.map(team => team.totalScore)
      const [team1Score, team2Score] = teamScores

      // Teams should have relatively similar total scores
      const scoreDifference = Math.abs(team1Score - team2Score)
      const averageScore = (team1Score + team2Score) / 2
      const percentageDifference = (scoreDifference / averageScore) * 100

      // Allow for some variance but should be reasonably balanced
      expect(percentageDifference).toBeLessThan(50) // Less than 50% difference
    })

    it('should distribute players to balance total scores', () => {
      const result = balanceTeams(mockPlayers, 2)

      // Check that both teams have players
      expect(result.teams[0].players.length).toBeGreaterThan(0)
      expect(result.teams[1].players.length).toBeGreaterThan(0)

      // Check that total scores are reasonably balanced
      const [team1Score, team2Score] = result.teams.map(team => team.totalScore)
      const scoreDifference = Math.abs(team1Score - team2Score)
      const averageScore = (team1Score + team2Score) / 2
      const balanceRatio = scoreDifference / averageScore

      // Should be reasonably balanced (allowing for some variance)
      expect(balanceRatio).toBeLessThan(1.0) // Less than 100% difference
    })

    it('should calculate correct team statistics', () => {
      const result = balanceTeams(mockPlayers, 2)

      result.teams.forEach(team => {
        // Calculate expected totals
        const expectedGameKnowledge = team.players.reduce(
          (sum, p) => sum + p.gameKnowledgeScore,
          0
        )
        const expectedGoalScoring = team.players.reduce(
          (sum, p) => sum + p.goalScoringScore,
          0
        )
        const expectedAttack = team.players.reduce(
          (sum, p) => sum + p.attackScore,
          0
        )
        const expectedMidfield = team.players.reduce(
          (sum, p) => sum + p.midfieldScore,
          0
        )
        const expectedDefense = team.players.reduce(
          (sum, p) => sum + p.defenseScore,
          0
        )
        const expectedFitness = team.players.reduce(
          (sum, p) => sum + p.fitnessScore,
          0
        )

        expect(team.totalGameKnowledgeScore).toBe(expectedGameKnowledge)
        expect(team.totalGoalScoringScore).toBe(expectedGoalScoring)
        expect(team.totalAttackScore).toBe(expectedAttack)
        expect(team.totalMidfieldScore).toBe(expectedMidfield)
        expect(team.totalDefenseScore).toBe(expectedDefense)
        expect(team.fitnessScore).toBe(expectedFitness)
      })
    })
  })

  describe('Gender Distribution', () => {
    it('should track gender counts correctly', () => {
      const result = balanceTeams(mockPlayers, 2)

      result.teams.forEach(team => {
        const expectedMaleCount = team.players.filter(
          p => p.gender === 'male'
        ).length
        const expectedFemaleCount = team.players.filter(
          p => p.gender === 'female'
        ).length
        const expectedNonBinaryCount = team.players.filter(
          p => p.gender === 'nonBinary'
        ).length

        expect(team.genderCount.male).toBe(expectedMaleCount)
        expect(team.genderCount.female).toBe(expectedFemaleCount)
        expect(team.genderCount.nonBinary).toBe(expectedNonBinaryCount)
      })
    })

    it('should handle all three gender types', () => {
      const diverseGenderPlayers = [
        { ...mockPlayers[0], gender: 'male' },
        { ...mockPlayers[1], gender: 'female' },
        { ...mockPlayers[2], gender: 'nonBinary' },
        { ...mockPlayers[3], gender: 'male' },
      ]

      const result = balanceTeams(diverseGenderPlayers, 2)

      const totalMale = result.teams.reduce(
        (sum, team) => sum + team.genderCount.male,
        0
      )
      const totalFemale = result.teams.reduce(
        (sum, team) => sum + team.genderCount.female,
        0
      )
      const totalNonBinary = result.teams.reduce(
        (sum, team) => sum + team.genderCount.nonBinary,
        0
      )

      expect(totalMale).toBe(2)
      expect(totalFemale).toBe(1)
      expect(totalNonBinary).toBe(1)
    })
  })

  describe('Data Type Handling', () => {
    it('should convert string numbers to actual numbers', () => {
      const playersWithStringNumbers = mockPlayers.map(player => ({
        ...player,
        gameKnowledgeScore: String(player.gameKnowledgeScore),
        goalScoringScore: String(player.goalScoringScore),
        attackScore: String(player.attackScore),
        midfieldScore: String(player.midfieldScore),
        defenseScore: String(player.defenseScore),
        fitnessScore: String(player.fitnessScore),
      }))

      const result = balanceTeams(playersWithStringNumbers, 2)

      result.teams.forEach(team => {
        team.players.forEach(player => {
          expect(typeof player.gameKnowledgeScore).toBe('number')
          expect(typeof player.goalScoringScore).toBe('number')
          expect(typeof player.attackScore).toBe('number')
          expect(typeof player.midfieldScore).toBe('number')
          expect(typeof player.defenseScore).toBe('number')
          expect(typeof player.fitnessScore).toBe('number')
        })
      })
    })

    it('should round scores to 2 decimal places', () => {
      const result = balanceTeams(mockPlayers, 2)

      result.teams.forEach(team => {
        expect(
          team.totalScore.toString().split('.')[1]?.length || 0
        ).toBeLessThanOrEqual(2)
        expect(
          team.totalGameKnowledgeScore.toString().split('.')[1]?.length || 0
        ).toBeLessThanOrEqual(2)
        expect(
          team.totalGoalScoringScore.toString().split('.')[1]?.length || 0
        ).toBeLessThanOrEqual(2)
        expect(
          team.totalAttackScore.toString().split('.')[1]?.length || 0
        ).toBeLessThanOrEqual(2)
        expect(
          team.totalMidfieldScore.toString().split('.')[1]?.length || 0
        ).toBeLessThanOrEqual(2)
        expect(
          team.totalDefenseScore.toString().split('.')[1]?.length || 0
        ).toBeLessThanOrEqual(2)
        expect(
          team.fitnessScore.toString().split('.')[1]?.length || 0
        ).toBeLessThanOrEqual(2)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle minimum valid input (2 players, 2 teams)', () => {
      const twoPlayers = mockPlayers.slice(0, 2)
      const result = balanceTeams(twoPlayers, 2)

      expect(result.teams).toHaveLength(2)
      expect(result.totalPlayersPlaying).toBe(2)
      expect(result.teams[0].players).toHaveLength(1)
      expect(result.teams[1].players).toHaveLength(1)
    })

    it('should handle large number of teams', () => {
      const result = balanceTeams(mockPlayers, 4)

      expect(result.teams).toHaveLength(4)
      expect(result.totalPlayersPlaying).toBe(4)

      // Each team should have at most 1 player (4 players / 4 teams)
      result.teams.forEach(team => {
        expect(team.players.length).toBeLessThanOrEqual(1)
      })
    })

    it('should handle identical player scores', () => {
      const identicalPlayers = Array(4)
        .fill(null)
        .map((_, index) => ({
          name: `Player ${index + 1}`,
          gameKnowledgeScore: 50,
          goalScoringScore: 50,
          attackScore: 50,
          midfieldScore: 50,
          defenseScore: 50,
          fitnessScore: 50,
          gender: index % 2 === 0 ? 'male' : 'female',
          isPlayingThisWeek: true,
        }))

      const result = balanceTeams(identicalPlayers, 2)

      expect(result.teams).toHaveLength(2)
      expect(result.totalPlayersPlaying).toBe(4)

      // Teams should have equal scores since all players are identical
      expect(result.teams[0].totalScore).toBe(result.teams[1].totalScore)
    })
  })
})
