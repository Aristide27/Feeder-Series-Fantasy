const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("./passport");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET manquant dans .env");

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
    console.log("[REGISTER] inserting user with columns: username, email, password_hash");
    const stmt = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    const result = stmt.run(username, emailValue, hashed);
    
    const userId = result.lastInsertRowid;

    // Auto-inscription à la ligue FSF Officiel
    try {
      const fsfLeague = db.prepare("SELECT id FROM leagues WHERE code = 'FSF'").get();
      
      if (fsfLeague) {
        // Ajouter l'utilisateur comme membre de la ligue FSF
        db.prepare(`
          INSERT INTO league_members (league_id, user_id)
          VALUES (?, ?)
        `).run(fsfLeague.id, userId);

        // Initialiser son score
        db.prepare(`
          INSERT INTO league_scores (league_id, user_id, total_points)
          VALUES (?, ?, 0)
        `).run(fsfLeague.id, userId);

        console.log(`[REGISTER] User ${username} auto-inscrit à la ligue FSF`);
      }
    } catch (leagueErr) {
      console.error("[REGISTER] Erreur auto-inscription FSF:", leagueErr.message);
      // On ne bloque pas l'inscription si l'ajout à la ligue échoue
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

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(400).json({ error: "Utilisateur inconnu" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(400).json({ error: "Mot de passe incorrect" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, username: user.username });
});

// --- Google OAuth - Démarrer l'authentification ---
router.get("/google", 
  passport.authenticate("google", { 
    scope: ["profile", "email"] 
  })
);

// --- Google OAuth - Callback après authentification ---
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
        { expiresIn: "7d" } // Token valide 7 jours
      );

      const frontendURL = process.env.FRONTEND_URL || "http://localhost:3001";
      res.redirect(`${frontendURL}/auth/callback?token=${token}&username=${encodeURIComponent(user.username)}`);
      
    } catch (err) {
      console.error("[GOOGLE CALLBACK ERROR]", err);
      res.redirect("/login?error=callback_failed");
    }
  }
);

module.exports = router;