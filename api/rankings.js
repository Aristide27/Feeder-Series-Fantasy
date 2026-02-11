const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./auth");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET manquant dans .env");

// ============================================
// GET /api/rankings/global - Classement mondial
// ============================================
router.get("/global", authenticateToken, (req, res) => {
  try {
    // Récupérer le classement mondial depuis la ligue officielle FSF
    const fsfLeague = db.prepare("SELECT id FROM leagues WHERE code = 'FSF'").get();
    
    if (!fsfLeague) {
      return res.status(404).json({ error: "Ligue officielle FSF introuvable" });
    }

    // Récupérer tous les joueurs avec leur score dans la ligue FSF
    const allRankings = db.prepare(`
      SELECT 
        u.id as user_id,
        u.username,
        COALESCE(ls.total_points, 0) as total_points,
        lm.joined_at,
        ROW_NUMBER() OVER (ORDER BY COALESCE(ls.total_points, 0) DESC) as rank
      FROM league_members lm
      JOIN users u ON lm.user_id = u.id
      LEFT JOIN league_scores ls ON lm.league_id = ls.league_id AND lm.user_id = ls.user_id
      WHERE lm.league_id = ?
      ORDER BY total_points DESC
    `).all(fsfLeague.id);

    // Marquer l'utilisateur actuel
    const rankings = allRankings.map(entry => ({
      ...entry,
      is_me: entry.user_id === req.user.id
    }));

    // Retourner tous les résultats (le frontend se chargera d'afficher Top 50 + position utilisateur)
    res.json(rankings);
  } catch (err) {
    console.error("[GET /api/rankings/global ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la récupération du classement" });
  }
});

module.exports = router;