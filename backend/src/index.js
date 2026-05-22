import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db/pool.js'
import authRouter        from './routes/auth.js'
import matchesRouter     from './routes/matches.js'
import predictionsRouter from './routes/predictions.js'
import adminRouter       from './routes/admin.js'
import newsRouter from './routes/news.js'
dotenv.config()
import { verifyToken } from './middleware/verifyToken.js';   
import { isAdmin } from './middleware/isAdmin.js';   

const app = express()
const PORT = process.env.PORT || 3000
const router = express.Router();

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/auth',        authRouter)
app.use('/matches',     matchesRouter)
app.use('/predictions', predictionsRouter)
app.use('/admin',       adminRouter)
app.use('/news', newsRouter)

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ status: 'ok', time: result.rows[0].now })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})

// dans routes/admin.js, ajoute :
router.delete('/competitions/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM competitions WHERE id = $1', [req.params.id])
    res.json({ message: 'Compétition supprimée' })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})
