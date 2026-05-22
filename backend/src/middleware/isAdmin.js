// src/middleware/isAdmin.js
const isAdmin = (req, res, next) => {
  // Vérifie que l'utilisateur est authentifié ET est admin
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Accès refusé : admin requis' });
};

export { isAdmin };   
