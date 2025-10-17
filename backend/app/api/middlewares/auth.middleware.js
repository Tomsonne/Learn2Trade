// app/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

export function verifyAuth(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Aucun token trouvé (non connecté)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // on ajoute les infos du user dans la requête

    next();
  } catch (err) {
    console.error("Erreur vérification JWT:", err.message);
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}
