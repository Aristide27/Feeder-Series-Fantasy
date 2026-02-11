const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authenticateToken } = require("./auth");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET manquant dans .env");

// ============================================
// GET /users/me - Récupérer le profil
// ============================================
router.get("/me", authenticateToken, (req, res) => {
  try {
    const user = db
      .prepare("SELECT id, username, email, created_at FROM users WHERE id = ?")
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err) {
    console.error("[GET /users/me ERROR]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// PATCH /users/me/username - Modifier le username
// ============================================
router.patch("/me/username", authenticateToken, async (req, res) => {
  let { username } = req.body;
  username = (username ?? "").trim();

  // Validation
  if (!username) {
    return res.status(400).json({ error: "Le username est requis" });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: "Le username doit contenir au moins 3 caractères" });
  }

  if (username.length > 30) {
    return res.status(400).json({ error: "Le username ne doit pas dépasser 30 caractères" });
  }

  // Vérifier que le username n'est pas déjà pris par un autre utilisateur
  try {
    const existingUser = db
      .prepare("SELECT id FROM users WHERE username = ? AND id != ?")
      .get(username, req.user.id);

    if (existingUser) {
      return res.status(400).json({ error: "Ce username est déjà utilisé" });
    }

    // Mettre à jour
    db.prepare("UPDATE users SET username = ? WHERE id = ?").run(username, req.user.id);

    res.json({ message: "Username modifié avec succès", username });
  } catch (err) {
    console.error("[PATCH /users/me/username ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la modification du username" });
  }
});

// ============================================
// PATCH /users/me/email - Modifier l'email
// ============================================
router.patch("/me/email", authenticateToken, (req, res) => {
  let { email } = req.body;
  email = (email ?? "").trim();

  // Validation basique de l'email
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  const emailValue = email.length ? email : null;

  try {
    // Vérifier que l'email n'est pas déjà pris par un autre utilisateur
    if (emailValue) {
      const existingUser = db
        .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
        .get(emailValue, req.user.id);

      if (existingUser) {
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
      }
    }

    db.prepare("UPDATE users SET email = ? WHERE id = ?").run(emailValue, req.user.id);

    res.json({ message: "Email modifié avec succès", email: emailValue });
  } catch (err) {
    console.error("[PATCH /users/me/email ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la modification de l'email" });
  }
});

// ============================================
// PATCH /users/me/password - Modifier le mot de passe
// ============================================
router.patch("/me/password", authenticateToken, async (req, res) => {
  let { oldPassword, newPassword } = req.body;
  oldPassword = oldPassword ?? "";
  newPassword = newPassword ?? "";

  // Validation
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Ancien et nouveau mot de passe requis" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
  }

  try {
    // Récupérer l'utilisateur avec son mot de passe hashé
    const user = db
      .prepare("SELECT id, password_hash FROM users WHERE id = ?")
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Vérifier que l'ancien mot de passe est correct
    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Ancien mot de passe incorrect" });
    }

    // Hasher le nouveau mot de passe
    const newHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, req.user.id);

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    console.error("[PATCH /users/me/password ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la modification du mot de passe" });
  }
});

module.exports = router;