import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1] // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, username, email }
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expiré' })
  }
}
