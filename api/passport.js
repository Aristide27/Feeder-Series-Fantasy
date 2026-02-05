const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../db");
const bcrypt = require("bcrypt");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️  Configuration Google OAuth manquante dans .env");
  console.warn("   L'authentification Google ne sera pas disponible");
}

// Sérialiser l'utilisateur pour la session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Désérialiser l'utilisateur depuis la session
passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare("SELECT id, username, email FROM users WHERE id = ?").get(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Stratégie Google OAuth
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extraire les infos du profil Google
          const googleId = profile.id;
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const firstName = profile.name?.givenName || "";
          const lastName = profile.name?.familyName || "";
          const displayName = profile.displayName;
          const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

          if (!email) {
            return done(new Error("Email non fourni par Google"), null);
          }

          // Vérifier si un utilisateur existe avec ce Google ID
          let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId);

          if (user) {
            // Utilisateur existe avec ce Google ID → connexion
            console.log(`[GOOGLE AUTH] Connexion : ${user.username} (${email})`);
            return done(null, user);
          }

          // Vérifier si un utilisateur existe avec cet email
          user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

          if (user) {
            // Email existe → lier le compte Google au compte existant
            db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(googleId, user.id);
            console.log(`[GOOGLE AUTH] Compte lié : ${user.username} (${email})`);
            return done(null, user);
          }

          // Nouvel utilisateur → créer un compte
          // Générer un username unique basé sur le nom ou l'email
          let username = displayName.replace(/\s+/g, "").toLowerCase();
          if (!username) {
            username = email.split("@")[0];
          }

          // Vérifier l'unicité du username
          let uniqueUsername = username;
          let counter = 1;
          while (db.prepare("SELECT id FROM users WHERE username = ?").get(uniqueUsername)) {
            uniqueUsername = `${username}${counter}`;
            counter++;
          }

          // Créer un mot de passe aléatoire (l'utilisateur ne l'utilisera jamais)
          const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          // Insérer le nouvel utilisateur
          const result = db.prepare(`
            INSERT INTO users (username, email, password_hash, google_id)
            VALUES (?, ?, ?, ?)
          `).run(uniqueUsername, email, hashedPassword, googleId);

          const userId = result.lastInsertRowid;

          // Auto-inscription à la ligue FSF
          try {
            const fsfLeague = db.prepare("SELECT id FROM leagues WHERE code = 'FSF'").get();
            
            if (fsfLeague) {
              db.prepare(`
                INSERT INTO league_members (league_id, user_id)
                VALUES (?, ?)
              `).run(fsfLeague.id, userId);

              db.prepare(`
                INSERT INTO league_scores (league_id, user_id, total_points)
                VALUES (?, ?, 0)
              `).run(fsfLeague.id, userId);

              console.log(`[GOOGLE AUTH] User ${uniqueUsername} auto-inscrit à la ligue FSF`);
            }
          } catch (leagueErr) {
            console.error("[GOOGLE AUTH] Erreur auto-inscription FSF:", leagueErr.message);
          }

          // Récupérer l'utilisateur créé
          user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
          
          console.log(`[GOOGLE AUTH] Nouveau compte créé : ${uniqueUsername} (${email})`);
          return done(null, user);

        } catch (err) {
          console.error("[GOOGLE AUTH ERROR]", err);
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;