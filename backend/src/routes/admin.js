import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = Router()

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé' })
  }
  next()
}

// GET /admin/matches — tous les matchs pour l'admin
router.get('/matches', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT m.*, c.name as competition_name, c.sport as competition_sport
    FROM matches m
    LEFT JOIN competitions c ON c.id = m.competition_id
    ORDER BY m.match_date DESC
    `)
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// POST /admin/matches — ajouter un match manuellement
router.post('/matches', verifyToken, isAdmin, async (req, res) => {
  const {
    competition_id, home_team, home_logo, away_team, away_logo,
    match_date, sport, status
  } = req.body
  if (!home_team || !away_team || !match_date) {
    return res.status(400).json({ message: 'home_team, away_team et match_date requis' })
  }
  try {
    const result = await pool.query(`
    INSERT INTO matches
    (competition_id, home_team, home_logo, away_team, away_logo, match_date, sport, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `, [
      competition_id || null,
      home_team, home_logo || '',
      away_team, away_logo || '',
      match_date,
      sport || 'football',
      status || 'UPCOMING'
    ])
    res.status(201).json(result.rows[0])
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// PATCH /admin/matches/:id — modifier un match (score, statut, etc.)
router.patch('/matches/:id', verifyToken, isAdmin, async (req, res) => {
  const { home_score, away_score, status, match_date } = req.body
  try {
    const result = await pool.query(`
    UPDATE matches
    SET
    home_score = COALESCE($1, home_score),
                                    away_score = COALESCE($2, away_score),
                                    status     = COALESCE($3, status),
                                    match_date = COALESCE($4, match_date)
                                    WHERE id = $5
                                    RETURNING *
                                    `, [home_score ?? null, away_score ?? null, status || null, match_date || null, req.params.id])
    if (!result.rows[0]) return res.status(404).json({ message: 'Match introuvable' })
      res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// DELETE /admin/matches/:id
router.delete('/matches/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM matches WHERE id = $1', [req.params.id])
    res.json({ message: 'Match supprimé' })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// GET /admin/competitions — liste des compétitions
router.get('/competitions', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM competitions ORDER BY name ASC')
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// POST /admin/competitions — ajouter une compétition
router.post('/competitions', verifyToken, isAdmin, async (req, res) => {
  const { name, country, sport, logo_url } = req.body
  if (!name || !sport) return res.status(400).json({ message: 'name et sport requis' })
    try {
      const result = await pool.query(`
      INSERT INTO competitions (name, country, sport, logo_url)
      VALUES ($1,$2,$3,$4) RETURNING *
      `, [name, country || '', sport, logo_url || ''])
      res.status(201).json(result.rows[0])
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
})

// GET /admin/predictions — tous les pronostics
router.get('/predictions', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT p.*, m.home_team, m.away_team, m.match_date
    FROM predictions p
    LEFT JOIN matches m ON m.id = p.match_id
    ORDER BY p.published_at DESC
    `)
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// POST /admin/predictions — publier un pronostic
router.post('/predictions', verifyToken, isAdmin, async (req, res) => {
  const { match_id, tip, odds, confidence, analysis, is_premium, market } = req.body
  if (!match_id || !tip || !odds) {
    return res.status(400).json({ message: 'match_id, tip et odds requis' })
  }
  try {
    const result = await pool.query(`
    INSERT INTO predictions (match_id, tip, odds, confidence, analysis, is_premium, market)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [match_id, tip, odds, confidence || 50, analysis || '', is_premium || false, market || '1X2'])
    res.status(201).json(result.rows[0])
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// PATCH /admin/predictions/:id — modifier un pronostic
router.patch('/predictions/:id', verifyToken, isAdmin, async (req, res) => {
  const { tip, odds, confidence, analysis, is_premium, result: predResult, market } = req.body
  try {
    const updated = await pool.query(`
    UPDATE predictions SET
    tip        = COALESCE($1, tip),
                                     odds       = COALESCE($2, odds),
                                     confidence = COALESCE($3, confidence),
                                     analysis   = COALESCE($4, analysis),
                                     is_premium = COALESCE($5, is_premium),
                                     result     = COALESCE($6, result),
                                     market     = COALESCE($7, market)
                                     WHERE id = $8 RETURNING *
                                     `, [tip||null, odds||null, confidence||null, analysis||null,
                                     is_premium??null, predResult||null, market||null, req.params.id])
    res.json(updated.rows[0])
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// DELETE /admin/predictions/:id
router.delete('/predictions/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM predictions WHERE id = $1', [req.params.id])
    res.json({ message: 'Pronostic supprimé' })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// PATCH /admin/predictions/:id/result — résultat rapide
router.patch('/predictions/:id/result', verifyToken, isAdmin, async (req, res) => {
  const { result } = req.body
  try {
    const updated = await pool.query(
      'UPDATE predictions SET result = $1 WHERE id = $2 RETURNING *',
      [result, req.params.id]
    )
    res.json(updated.rows[0])
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

export default router
