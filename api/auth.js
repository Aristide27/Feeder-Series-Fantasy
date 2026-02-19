const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("./passport");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET manquant dans .env");

// MIDDLEWARE D'AUTHENTIFICATION
async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await db.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [decoded.id]
    );
    
    if (!result.rows[0]) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }
    
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
}

// --- Inscription ---
router.post("/register", async (req, res) => {
  let { username, email, password } = req.body;

  username = (username ?? "").trim();
  email = (email ?? "").trim();
  password = password ?? "";

  if (!username || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const emailValue = email.length ? email : null;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [username, emailValue, hashed]
    );
    
    const userId = result.rows[0].id;

    // Auto-inscription à la ligue FSF Officiel
    try {
      const fsfLeague = await db.query(
        "SELECT id FROM leagues WHERE code = 'FSF'"
      );
      
      if (fsfLeague.rows[0]) {
        await db.query(
          "INSERT INTO league_members (league_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [fsfLeague.rows[0].id, userId]
        );

        await db.query(
          "INSERT INTO league_scores (league_id, user_id, total_points) VALUES ($1, $2, 0) ON CONFLICT DO NOTHING",
          [fsfLeague.rows[0].id, userId]
        );

        console.log(`[REGISTER] User ${username} auto-inscrit à la ligue FSF`);
      }
    } catch (leagueErr) {
      console.error("[REGISTER] Erreur auto-inscription FSF:", leagueErr.message);
    }

    return res.json({ message: "Compte créé !" });
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    return res.status(400).json({ error: err?.message ?? "Erreur inscription" });
  }
});

// --- Login ---
router.post("/login", async (req, res) => {
  let { username, password } = req.body;
  username = (username ?? "").trim();
  password = password ?? "";

  const result = await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  const user = result.rows[0];
  
  if (!user) return res.status(400).json({ error: "Utilisateur inconnu" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(400).json({ error: "Mot de passe incorrect" });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token, username: user.username });
});

// --- Google OAuth ---
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// --- Google OAuth Callback ---
router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=google_auth_failed",
    session: false
  }),
  (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect("/login?error=no_user");
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const frontendURL = process.env.FRONTEND_URL || "http://localhost:3001";
      res.redirect(`${frontendURL}/auth/callback?token=${token}&username=${encodeURIComponent(user.username)}`);
      
    } catch (err) {
      console.error("[GOOGLE CALLBACK ERROR]", err);
      res.redirect("/login?error=callback_failed");
    }
  }
);

// --- Vérifier le token ---
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await db.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [decoded.id]
    );
    
    if (!result.rows[0]) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    res.json({
      id: result.rows[0].id,
      username: result.rows[0].username,
      email: result.rows[0].email
    });

  } catch (err) {
    console.error("[GET /api/auth/me] Token invalide:", err.message);
    res.status(401).json({ error: "Token invalide" });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;