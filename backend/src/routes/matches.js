import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyToken } from '../middleware/verifyToken.js'
import fetch from 'node-fetch'
import { getLiveFixtures } from '../services/football-api.js'

const router = Router()

// GET /matches — tous les matchs avec stats et forme
router.get('/', verifyToken, async (req, res) => {
  try {
    const matchesResult = await pool.query(`
      SELECT m.*, c.name as competition_name, c.logo_url as competition_logo, c.sport as competition_sport
      FROM matches m
      LEFT JOIN competitions c ON c.id = m.competition_id
      ORDER BY m.match_date ASC
    `)

    const matches = matchesResult.rows

    // Pour chaque match, récupérer stats et forme
    for (const match of matches) {
      const statsResult = await pool.query(
        'SELECT * FROM match_stats WHERE match_id = $1 ORDER BY team, sort_order',
        [match.id]
      )
      const formResult = await pool.query(
        'SELECT * FROM team_form WHERE match_id = $1',
        [match.id]
      )

      match.stats = statsResult.rows
      match.form  = formResult.rows
    }

    res.json(matches)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /matches/live — scores en direct


router.get('/live', verifyToken, async (req, res) => {
  try {
    const [footRes, basketRes] = await Promise.all([
      fetch('https://www.thesportsdb.com/api/v1/json/3/eventslive.php?s=Soccer'),
      fetch('https://www.thesportsdb.com/api/v1/json/3/eventslive.php?s=Basketball'),
    ])

    const [footData, basketData] = await Promise.all([
      footRes.json(),
      basketRes.json(),
    ])

    const events = [
      ...(footData.events || []),
      ...(basketData.events || []),
    ]

    const live = events.map(e => ({
      api_id:      e.idEvent,
      home_team:   e.strHomeTeam,
      home_logo:   `https://www.thesportsdb.com/images/media/team/badge/${e.idHomeTeam}.png`,
      away_team:   e.strAwayTeam,
      away_logo:   `https://www.thesportsdb.com/images/media/team/badge/${e.idAwayTeam}.png`,
      home_score:  e.intHomeScore ?? 0,
      away_score:  e.intAwayScore ?? 0,
      minute:      e.strProgress || e.strStatus || 'LIVE',
      competition: e.strLeague,
      sport:       e.strSport,
    }))

    res.json(live)
  } catch (error) {
    console.error('LIVE ERROR:', error.message)
    res.json([])
  }
})

// GET /matches/:id — détail d'un match

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const matchResult = await pool.query(`
      SELECT m.*, c.name as competition_name, c.logo_url as competition_logo
      FROM matches m
      LEFT JOIN competitions c ON c.id = m.competition_id
      WHERE m.id = $1
    `, [req.params.id])

    if (!matchResult.rows[0]) {
      return res.status(404).json({ message: 'Match introuvable' })
    }

    const match = matchResult.rows[0]

    const [statsResult, formResult, predictionsResult] = await Promise.all([
      pool.query('SELECT * FROM match_stats WHERE match_id = $1 ORDER BY team, sort_order', [match.id]),
      pool.query('SELECT * FROM team_form WHERE match_id = $1', [match.id]),
      pool.query('SELECT * FROM predictions WHERE match_id = $1 ORDER BY published_at DESC', [match.id])
    ])

    match.stats       = statsResult.rows
    match.form        = formResult.rows
    match.predictions = predictionsResult.rows

    res.json(match)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
