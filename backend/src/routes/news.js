import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

const SOURCES = {
  bbc:     'https://feeds.bbci.co.uk/sport/football/rss.xml',
  sky:     'https://www.skysports.com/rss/12040',
  espn:    'https://www.espn.com/espn/rss/soccer/news',
  nba:     'https://www.espn.com/espn/rss/nba/news',
}

router.get('/', async (req, res) => {
  const key = req.query.source || 'bbc'
  const url = SOURCES[key]
  if (!url) return res.status(400).json({ error: 'Source inconnue' })

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WinProno/1.0)' }
    })
    const xml = await response.text()
    res.set('Content-Type', 'application/xml')
    res.send(xml)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
