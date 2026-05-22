import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = Router()

// GET /predictions — tous les pronostics publiés
router.get('/', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id

    // Vérifier si premium
    const subResult = await pool.query(
      `SELECT plan FROM subscriptions WHERE user_id = $1
       AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC LIMIT 1`,
      [user_id]
    )
    const isPremium = subResult.rows[0]?.plan === 'premium'
      || req.user.role === 'admin'

    const result = await pool.query(`
      SELECT p.*, 
        m.home_team, m.away_team, m.home_logo, m.away_logo,
        m.match_date, m.status as match_status,
        m.home_score, m.away_score, m.api_id as match_api_id,
        c.name as competition_name, c.logo_url as competition_logo
      FROM predictions p
      JOIN matches m ON m.id = p.match_id
      LEFT JOIN competitions c ON c.id = m.competition_id
      WHERE (p.is_premium = FALSE OR $1 = TRUE)
      ORDER BY m.match_date ASC
    `, [isPremium])

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /predictions/stats — stats globales (taux de réussite, ROI)
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE result != 'PENDING') as total,
        COUNT(*) FILTER (WHERE result = 'WON') as won,
        COUNT(*) FILTER (WHERE result = 'LOST') as lost,
        ROUND(
          COUNT(*) FILTER (WHERE result = 'WON') * 100.0 /
          NULLIF(COUNT(*) FILTER (WHERE result != 'PENDING' AND result != 'VOID'), 0)
        , 1) as win_rate,
        ROUND(AVG(odds) FILTER (WHERE result != 'PENDING'), 2) as avg_odds
      FROM predictions
    `)
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
