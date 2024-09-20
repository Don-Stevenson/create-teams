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

  // Loop over teams and assign players, balancing gender and roles
  for (let i = 0; i < players.length; i++) {
    // Calculate which team has the fewest players
    const team = teams.reduce(
      (acc, curr) => (acc.players.length < curr.players.length ? acc : curr),
      teams[0]
    )

    // Ensure gender balance by alternating between male and female if possible
    let player
    if (team.genderCount.male < team.genderCount.female && males.length) {
      player = males.shift()
    } else if (
      team.genderCount.female < team.genderCount.male &&
      females.length
    ) {
      player = females.shift()
    } else if (males.length) {
      player = males.shift()
    } else {
      player = females.shift()
    }

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

    const isAttacker = player.attackScore > player.defenseScore
    if (isAttacker) {
      team.attackerCount++
    } else {
      team.defenderCount++
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
    } else {
      team.defenderCount++
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

function generate_mock_players(numPlayers = 20) {
  let players = []
  const firstNames = [
    'Alex',
    'Jordan',
    'Taylor',
    'Morgan',
    'Casey',
    'Drew',
    'Riley',
    'Quinn',
    'Avery',
    'Harper',
  ]
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Sharp',
    'Pickford',
  ]
  const genders = ['male', 'female']

  for (let i = 0; i < numPlayers; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const gender = genders[Math.floor(Math.random() * genders.length)]
    const attackScore = Math.floor(Math.random() * 51) // 0 to 50
    const defenseScore = Math.floor(Math.random() * 51) // 0 to 50
    const fitnessScore = Math.floor(Math.random() * 51) // 0 to 50
    const totalScore =
      attackScore * 0.4 + defenseScore * 0.4 + fitnessScore * 0.2

    players.push({
      name: `${firstName} ${lastName}`,
      attackScore,
      defenseScore,
      fitnessScore,
      totalScore,
      gender,
    })
  }

  return players
}

balanceTeams(generate_mock_players(), 3)



// File structure (updated)
// mern-team-balancer/
//   ├── client/
//   │   ├── public/
//   │   ├── src/
//   │   │   ├── components/
//   │   │   │   ├── PlayerList.js
//   │   │   │   ├── AddPlayerForm.js
//   │   │   │   ├── WeeklySelection.js
//   │   │   │   └── BalanceTeams.js
//   │   │   ├── utils/
//   │   │   │   └── api.js
//   │   │   ├── App.js
//   │   │   └── index.js
//   │   └── package.json
//   ├── server/
//   │   ├── models/
//   │   │   └── Player.js
//   │   ├── routes/
//   │   │   └── api.js
//   │   ├── middleware/
//   │   │   ├── errorHandler.js
//   │   │   └── validate.js
//   │   ├── config/
//   │   │   └── db.js
//   │   ├── utils/
//   │   │   └── teamBalancer.js
//   │   ├── server.js
//   │   └── package.json
//   └── package.json

// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Security middlewares
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body

// Routes
app.use('/api', require('./routes/api'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};

module.exports = errorHandler;

// server/middleware/validate.js
const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

module.exports = validate;

// server/routes/api.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const Player = require('../models/Player');
const balanceTeams = require('../utils/teamBalancer');
const validate = require('../middleware/validate');

// Validation rules
const playerValidationRules = [
  check('name').trim().isLength({ min: 2, max: 50 }).escape(),
  check('attackScore').isInt({ min: 0, max: 100 }),
  check('defenseScore').isInt({ min: 0, max: 100 }),
  check('fitnessScore').isInt({ min: 0, max: 100 }),
  check('gender').isIn(['male', 'female', 'other'])
];

// GET all players
router.get('/players', async (req, res, next) => {
  try {
    const players = await Player.find().select('-__v');
    res.json(players);
  } catch (err) {
    next(err);
  }
});

// POST a new player
router.post('/players', validate(playerValidationRules), async (req, res, next) => {
  try {
    const player = new Player(req.body);
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (err) {
    next(err);
  }
});

// PUT update player's weekly status
router.put('/players/:id', 
  [check('isPlayingThisWeek').isBoolean()],
  validate([check('isPlayingThisWeek').isBoolean()]),
  async (req, res, next) => {
    try {
      const updatedPlayer = await Player.findByIdAndUpdate(
        req.params.id,
        { isPlayingThisWeek: req.body.isPlayingThisWeek },
        { new: true, runValidators: true }
      );
      if (!updatedPlayer) {
        return res.status(404).json({ message: 'Player not found' });
      }
      res.json(updatedPlayer);
    } catch (err) {
      next(err);
    }
  }
);

// POST balance teams
router.post('/balance-teams', 
  validate([check('numTeams').isInt({ min: 2, max: 10 })]),
  async (req, res, next) => {
    try {
      const playingPlayers = await Player.find({ isPlayingThisWeek: true });
      const balancedTeams = balanceTeams(playingPlayers, req.body.numTeams);
      res.json(balancedTeams);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

// client/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

export default api;

// client/src/components/AddPlayerForm.js
import React, { useState } from 'react';
import api from '../utils/api';

const AddPlayerForm = () => {
  const [playerData, setPlayerData] = useState({
    name: '',
    attackScore: '',
    defenseScore: '',
    fitnessScore: '',
    gender: ''
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/players', playerData);
      // Reset form or update player list
      setPlayerData({
        name: '',
        attackScore: '',
        defenseScore: '',
        fitnessScore: '',
        gender: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleChange = (e) => {
    setPlayerData({ ...playerData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={playerData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      <input
        type="number"
        name="attackScore"
        value={playerData.attackScore}
        onChange={handleChange}
        placeholder="Attack Score"
        min="0"
        max="100"
        required
      />
      <input
        type="number"
        name="defenseScore"
        value={playerData.defenseScore}
        onChange={handleChange}
        placeholder="Defense Score"
        min="0"
        max="100"
        required
      />
      <input
        type="number"
        name="fitnessScore"
        value={playerData.fitnessScore}
        onChange={handleChange}
        placeholder="Fitness Score"
        min="0"
        max="100"
        required
      />
      <select
        name="gender"
        value={playerData.gender}
        onChange={handleChange}
        required
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <button type="submit">Add Player</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AddPlayerForm;

// Instructions for additional security measures
/*
1. Environment Variables:
   - Use .env files to store sensitive information like database URLs and API keys.
   - In the server directory, create a .env file:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     NODE_ENV=development
     ```
   - Use the dotenv package to load these variables:
     ```javascript
     require('dotenv').config();
     ```

2. HTTPS:
   - In production, ensure your application is served over HTTPS.
   - You can use services like Let's Encrypt for free SSL certificates.

3. Authentication:
   - Implement user authentication using JSON Web Tokens (JWT) or sessions.
   - Protect sensitive routes with authentication middleware.

4. Input Sanitization:
   - Use libraries like validator.js for additional input validation and sanitization.

5. CSRF Protection:
   - Implement CSRF protection using the csurf package for Express.

6. Secure Headers:
   - The helmet package is already included, which sets various HTTP headers for security.

7. Logging:
   - Implement proper logging using a library like winston for better debugging and monitoring.

8. Rate Limiting:
   - The express-rate-limit package is already included to prevent abuse of your API.

9. Keep Dependencies Updated:
   - Regularly update your npm packages to patch security vulnerabilities.

10. Code Reviews:
    - Conduct thorough code reviews to catch potential security issues early.

11. Security Audits:
    - Regularly perform security audits of your application.
    - Use tools like npm audit to check for vulnerabilities in your dependencies.
*/

// // File structure (updated for Next.js)
// nextjs-team-balancer/
//   ├── pages/
//   │   ├── index.js
//   │   ├── players.js
//   │   └── balance-teams.js
//   ├── components/
//   │   ├── Layout.js
//   │   ├── PlayerList.js
//   │   ├── AddPlayerForm.js
//   │   └── BalanceTeams.js
//   ├── styles/
//   │   └── globals.css
//   ├── utils/
//   │   └── api.js
//   ├── server/
//   │   ├── models/
//   │   │   └── Player.js
//   │   ├── routes/
//   │   │   └── api.js
//   │   ├── middleware/
//   │   │   ├── errorHandler.js
//   │   │   └── validate.js
//   │   ├── utils/
//   │   │   └── teamBalancer.js
//   │   └── index.js
//   ├── next.config.js
//   ├── tailwind.config.js
//   └── package.json

// server/utils/teamBalancer.js
function balanceTeams(players, numTeams) {
  // ... (previous balancing logic)

  // Calculate team stats
  teams.forEach(team => {
    team.totalAttack = team.players.reduce((sum, player) => sum + player.attackScore, 0);
    team.totalDefense = team.players.reduce((sum, player) => sum + player.defenseScore, 0);
    team.totalFitness = team.players.reduce((sum, player) => sum + player.fitnessScore, 0);
    team.genderCount = {
      male: team.players.filter(p => p.gender === 'male').length,
      female: team.players.filter(p => p.gender === 'female').length,
      other: team.players.filter(p => p.gender === 'other').length
    };
  });

  return teams;
}

module.exports = balanceTeams;

// server/routes/api.js
// ... (previous imports)

router.post('/balance-teams', 
  validate([check('numTeams').isInt({ min: 2, max: 10 })]),
  async (req, res, next) => {
    try {
      const playingPlayers = await Player.find({ isPlayingThisWeek: true });
      const balancedTeams = balanceTeams(playingPlayers, req.body.numTeams);
      res.json(balancedTeams);
    } catch (err) {
      next(err);
    }
  }
);

// pages/index.js
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-8 text-red-600">Team Balancer App</h1>
        <div className="flex space-x-4">
          <Link href="/players">
            <a className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Manage Players
            </a>
          </Link>
          <Link href="/balance-teams">
            <a className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
              Balance Teams
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

// pages/players.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PlayerList from '../components/PlayerList';
import AddPlayerForm from '../components/AddPlayerForm';
import api from '../utils/api';

export default function Players() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await api.get('/players');
        setPlayers(res.data);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    };
    fetchPlayers();
  }, []);

  const addPlayer = (newPlayer) => {
    setPlayers([...players, newPlayer]);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-600">Manage Players</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Add New Player</h2>
            <AddPlayerForm onAddPlayer={addPlayer} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Player List</h2>
            <PlayerList players={players} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// pages/balance-teams.js
import { useState } from 'react';
import Layout from '../components/Layout';
import BalanceTeams from '../components/BalanceTeams';

export default function BalanceTeamsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-600">Balance Teams</h1>
        <BalanceTeams />
      </div>
    </Layout>
  );
}

// components/Layout.js
import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Team Balancer App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="bg-red-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Team Balancer</h1>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

// components/PlayerList.js
export default function PlayerList({ players }) {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <ul className="divide-y divide-gray-200">
        {players.map((player) => (
          <li key={player._id} className="py-4">
            <div className="flex justify-between">
              <span className="font-semibold">{player.name}</span>
              <span className="text-gray-500">{player.gender}</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Attack: {player.attackScore} | Defense: {player.defenseScore} | Fitness: {player.fitnessScore}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// components/AddPlayerForm.js
import { useState } from 'react';
import api from '../utils/api';

export default function AddPlayerForm({ onAddPlayer }) {
  const [playerData, setPlayerData] = useState({
    name: '',
    attackScore: '',
    defenseScore: '',
    fitnessScore: '',
    gender: ''
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/players', playerData);
      onAddPlayer(res.data);
      setPlayerData({
        name: '',
        attackScore: '',
        defenseScore: '',
        fitnessScore: '',
        gender: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleChange = (e) => {
    setPlayerData({ ...playerData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          name="name"
          value={playerData.name}
          onChange={handleChange}
          required
        />
      </div>
      {/* Similar input fields for attackScore, defenseScore, fitnessScore */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
          Gender
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="gender"
          name="gender"
          value={playerData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Add Player
        </button>
      </div>
      {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
    </form>
  );
}

// components/BalanceTeams.js
import { useState } from 'react';
import api from '../utils/api';

export default function BalanceTeams() {
  const [numTeams, setNumTeams] = useState(2);
  const [balancedTeams, setBalancedTeams] = useState(null);
  const [error, setError] = useState(null);

  const handleBalanceTeams = async () => {
    setError(null);
    try {
      const res = await api.post('/balance-teams', { numTeams });
      setBalancedTeams(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numTeams">
          Number of Teams
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="numTeams"
          type="number"
          min="2"
          max="10"
          value={numTeams}
          onChange={(e) => setNumTeams(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleBalanceTeams}
        >
          Balance Teams
        </button>
      </div>
      {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
      {balancedTeams && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Balanced Teams</h2>
          {balancedTeams.map((team, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded">
              <h3 className="text-xl font-semibold mb-2">Team {index + 1}</h3>
              <p>Total Attack: {team.totalAttack}</p>
              <p>Total Defense: {team.totalDefense}</p>
              <p>Total Fitness: {team.totalFitness}</p>
              <p>Gender Distribution: Male - {team.genderCount.male}, Female - {team.genderCount.female}, Other - {team.genderCount.other}</p>
              <h4 className="font-semibold mt-2">Players:</h4>
              <ul className="list-disc pl-5">
                {team.players.map((player) => (
                  <li key={player._id}>
                    {player.name} (A: {player.attackScore}, D: {player.defenseScore}, F: {player.fitnessScore})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// styles/globals.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

body {
  @apply bg-gray-100;
}

// tailwind.config.js
module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        red: {
          600: '#DC2626',
          700: '#B91C1C',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

// next.config.js
module.exports = {
  reactStrictMode: true,
}

// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

export default api;