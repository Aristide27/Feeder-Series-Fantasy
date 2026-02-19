const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./auth");
const JWT_SECRET = "ton_secret_ici";
// --- Profil ---
router.get("/me", authenticateToken, async (req, res) => {
  const result = await db.query("SELECT id, username, email FROM users WHERE id = $1", [req.user.id]);
  res.json(result.rows[0]);
});
// --- Mettre à jour email ---
router.put("/me", authenticateToken, async (req, res) => {
  const { email } = req.body;
  await db.query("UPDATE users SET email = $1 WHERE id = $2", [email, req.user.id]);
  res.json({ message: "Profil mis à jour" });
});
// GET /api/fantasy/driver-seasons?season=2025
router.get("/driver-seasons", async (req, res) => {
  const season = Number(req.query.season);
  if (!season) return res.status(400).json({ error: "season is required" });
  const result = await db.query(`
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
    WHERE ds.season = $1
    ORDER BY c.name, d.name
  `, [season]);
  res.json(result.rows);
});
router.get("/constructors", async (req, res) => {
  const result = await db.query(`
    SELECT id AS constructor_id, name, slug, nationality, price
    FROM constructors
    ORDER BY name
  `);
  res.json(result.rows);
});
module.exports = router;