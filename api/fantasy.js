const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./auth");
const JWT_SECRET = "ton_secret_ici";

// --- Profil ---
router.get("/me", authenticateToken, (req, res) => {
  const user = db.prepare("SELECT id, username, email FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

// --- Mettre à jour email ---
router.put("/me", authenticateToken, (req, res) => {
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
      d.id                 AS driver_id,
      d.name               AS driver_name,
      d.nationality        AS driver_nationality,

      ds.season            AS season,
      ds.rookie            AS rookie,
      ds.price             AS driver_price,

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
