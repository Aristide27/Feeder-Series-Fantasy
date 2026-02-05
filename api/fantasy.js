const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "ton_secret_ici";

// Middleware simple pour récupérer l'utilisateur connecté
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
}

// --- Profil ---
router.get("/me", auth, (req, res) => {
  const user = db.prepare("SELECT id, username, email FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

// --- Mettre à jour email ---
router.put("/me", auth, (req, res) => {
  const { email } = req.body;
  db.prepare("UPDATE users SET email = ? WHERE id = ?").run(email, req.user.id);
  res.json({ message: "Profil mis à jour" });
});

// GET /api/fantasy/driver-seasons?season=2025
router.get("/driver-seasons", (req, res) => {
  const season = Number(req.query.season);
  if (!season) return res.status(400).json({ error: "season is required" });

  const rows = db.prepare(`
    SELECT
      ds.id                AS driver_season_id,
      ds.season            AS season,
      ds.rookie            AS rookie,
      ds.price             AS driver_price,

      d.id                 AS driver_id,
      d.name               AS driver_name,
      d.nationality        AS driver_nationality,

      c.id                 AS constructor_id,
      c.name               AS constructor_name,
      c.nationality        AS constructor_nationality
    FROM driver_seasons ds
    JOIN drivers d ON d.id = ds.driver_id
    JOIN constructors c ON c.id = ds.constructor_id
    WHERE ds.season = ?
    ORDER BY c.name, d.name
  `).all(season);

  res.json(rows);
});

router.get("/constructors", (req, res) => {
  const rows = db.prepare(`
    SELECT id AS constructor_id, name, slug, nationality, price
    FROM constructors
    ORDER BY name
  `).all();
  res.json(rows);
});

module.exports = router;
