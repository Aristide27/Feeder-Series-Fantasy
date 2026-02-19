const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../db");
const bcrypt = require("bcrypt");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("Configuration Google OAuth manquante dans .env");
  console.warn("   L'authentification Google ne sera pas disponible");
}

// Sérialiser l'utilisateur pour la session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Désérialiser l'utilisateur depuis la session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query("SELECT id, username, email FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
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
          let userResult = await db.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
          let user = userResult.rows[0];

          if (user) {
            // Utilisateur existe avec ce Google ID → connexion
            console.log(`[GOOGLE AUTH] Connexion : ${user.username} (${email})`);
            return done(null, user);
          }

          // Vérifier si un utilisateur existe avec cet email
          userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
          user = userResult.rows[0];

          if (user) {
            // Email existe → lier le compte Google au compte existant
            await db.query("UPDATE users SET google_id = $1 WHERE id = $2", [googleId, user.id]);
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
          while ((await db.query("SELECT id FROM users WHERE username = $1", [uniqueUsername])).rows[0]) {
            uniqueUsername = `${username}${counter}`;
            counter++;
          }

          // Créer un mot de passe aléatoire (l'utilisateur ne l'utilisera jamais)
          const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          // Insérer le nouvel utilisateur
          const result = await db.query(`
            INSERT INTO users (username, email, password_hash, google_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `, [uniqueUsername, email, hashedPassword, googleId]);

          const userId = result.rows[0].id;

          // Auto-inscription à la ligue FSF
          try {
            const fsfLeague = await db.query("SELECT id FROM leagues WHERE code = 'FSF'");
            
            if (fsfLeague.rows[0]) {
              await db.query(`
                INSERT INTO league_members (league_id, user_id)
                VALUES ($1, $2)
              `, [fsfLeague.rows[0].id, userId]);

              await db.query(`
                INSERT INTO league_scores (league_id, user_id, total_points)
                VALUES ($1, $2, 0)
              `, [fsfLeague.rows[0].id, userId]);

              console.log(`[GOOGLE AUTH] User ${uniqueUsername} auto-inscrit à la ligue FSF`);
            }
          } catch (leagueErr) {
            console.error("[GOOGLE AUTH] Erreur auto-inscription FSF:", leagueErr.message);
          }

          // Récupérer l'utilisateur créé
          userResult = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
          user = userResult.rows[0];
          
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