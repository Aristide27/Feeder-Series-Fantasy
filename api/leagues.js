const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./auth");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET manquant dans .env");

// ============================================
// HELPER: Générer un code unique
// ============================================
async function generateUniqueCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;

    const existing = await db.query("SELECT id FROM leagues WHERE code = $1", [code]);
    if (!existing.rows[0]) break;

    if (attempts >= maxAttempts) {
      throw new Error("Impossible de gÃ©nÃ©rer un code unique");
    }
  } while (true);

  return code;
}

// ============================================
// GET /api/leagues/public/fsf - Ligue FSF publique (pas d'auth)
// ============================================
router.get("/public/fsf", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, code, is_official
      FROM leagues
      WHERE code = 'FSF' OR is_official = 1
      LIMIT 1
    `);

    const fsfLeague = result.rows[0];

    if (!fsfLeague) {
      return res.status(404).json({ error: "Ligue FSF introuvable" });
    }

    res.json(fsfLeague);
  } catch (err) {
    console.error("[GET /api/leagues/public/fsf ERROR]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// POST /api/leagues - Créer une ligue
// ============================================
router.post("/", authenticateToken, async (req, res) => {
  let { name } = req.body;
  name = (name ?? "").trim();

  // Validation
  if (!name) {
    return res.status(400).json({ error: "Le nom de la ligue est requis" });
  }

  if (name.length < 3) {
    return res.status(400).json({ error: "Le nom doit contenir au moins 3 caractÃ¨res" });
  }

  if (name.length > 50) {
    return res.status(400).json({ error: "Le nom ne doit pas dÃ©passer 50 caractÃ¨res" });
  }

  try {
    // VÃ©rifier le nombre de ligues crÃ©Ã©es par l'utilisateur (max 10)
    const userLeagues = await db.query(
      "SELECT COUNT(*) as count FROM leagues WHERE creator_id = $1 AND is_official = 0",
      [req.user.id]
    );

    if (userLeagues.rows[0].count >= 10) {
      return res.status(400).json({ error: "Vous avez atteint la limite de 10 ligues" });
    }

    // Générer un code unique
    const code = await generateUniqueCode();

    // Créer la ligue
    const result = await db.query(`
      INSERT INTO leagues (name, code, creator_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [name, code, req.user.id]);

    const leagueId = result.rows[0].id;

    // Ajouter le créateur comme membre
    await db.query(`
      INSERT INTO league_members (league_id, user_id)
      VALUES ($1, $2)
    `, [leagueId, req.user.id]);

    // Initialiser le score du créateur
    await db.query(`
      INSERT INTO league_scores (league_id, user_id, total_points)
      VALUES ($1, $2, 0)
    `, [leagueId, req.user.id]);

    res.json({
      message: "Ligue crÃ©Ã©e avec succÃ¨s",
      league: {
        id: leagueId,
        name,
        code,
        creator_id: req.user.id,
      },
    });
  } catch (err) {
    console.error("[POST /api/leagues ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la crÃ©ation de la ligue" });
  }
});

// ============================================
// POST /api/leagues/join - Rejoindre une ligue
// ============================================
router.post("/join", authenticateToken, async (req, res) => {
  let { code } = req.body;
  code = (code ?? "").trim().toUpperCase();

  if (!code) {
    return res.status(400).json({ error: "Le code est requis" });
  }

  try {
    // VÃ©rifier que la ligue existe
    const leagueResult = await db.query("SELECT * FROM leagues WHERE code = $1", [code]);
    const league = leagueResult.rows[0];

    if (!league) {
      return res.status(404).json({ error: "Ligue introuvable avec ce code" });
    }

    // VÃ©rifier si la ligue est fermÃ©e
    if (league.is_closed) {
      return res.status(400).json({ error: "Cette ligue est fermÃ©e et n'accepte plus de nouveaux membres" });
    }

    // VÃ©rifier si l'utilisateur est dÃ©jÃ  membre
    const alreadyMember = await db.query(
      "SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2",
      [league.id, req.user.id]
    );

    if (alreadyMember.rows[0]) {
      return res.status(400).json({ error: "Vous Ãªtes dÃ©jÃ  membre de cette ligue" });
    }

    // Ajouter l'utilisateur comme membre
    await db.query(`
      INSERT INTO league_members (league_id, user_id)
      VALUES ($1, $2)
    `, [league.id, req.user.id]);

    // Initialiser le score de l'utilisateur
    await db.query(`
      INSERT INTO league_scores (league_id, user_id, total_points)
      VALUES ($1, $2, 0)
    `, [league.id, req.user.id]);

    res.json({
      message: "Vous avez rejoint la ligue avec succÃ¨s",
      league: {
        id: league.id,
        name: league.name,
        code: league.code,
      },
    });
  } catch (err) {
    console.error("[POST /api/leagues/join ERROR]", err);
    res.status(500).json({ error: "Erreur lors de l'inscription Ã  la ligue" });
  }
});

// ============================================
// GET /api/leagues - Liste des ligues de l'utilisateur
// ============================================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        l.id,
        l.name,
        l.code,
        l.is_official,
        l.is_closed,
        l.creator_id,
        ls.total_points,
        (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count,
        (
          SELECT COUNT(*) + 1
          FROM league_scores ls2
          WHERE ls2.league_id = l.id
          AND ls2.total_points > ls.total_points
        ) as rank
      FROM leagues l
      JOIN league_members lm ON l.id = lm.league_id
      LEFT JOIN league_scores ls ON l.id = ls.league_id AND ls.user_id = $1
      WHERE lm.user_id = $2
      ORDER BY l.is_official DESC, l.created_at DESC
    `, [req.user.id, req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error("[GET /api/leagues ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la rÃ©cupÃ©ration des ligues" });
  }
});

// ============================================
// GET /api/leagues/:code - Détails d'une ligue
// ============================================
router.get("/:code", authenticateToken, async (req, res) => {
  const { code } = req.params;

  try {
    // RÃ©cupÃ©rer la ligue
    const leagueResult = await db.query(`
      SELECT 
        l.*,
        u.username as creator_username,
        (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count
      FROM leagues l
      LEFT JOIN users u ON l.creator_id = u.id
      WHERE l.code = $1
    `, [code.toUpperCase()]);

    const league = leagueResult.rows[0];

    if (!league) {
      return res.status(404).json({ error: "Ligue introuvable" });
    }

    // VÃ©rifier si l'utilisateur est membre
    const isMember = await db.query(
      "SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2",
      [league.id, req.user.id]
    );

    if (!isMember.rows[0]) {
      return res.status(403).json({ error: "Vous n'Ãªtes pas membre de cette ligue" });
    }

    // VÃ©rifier si l'utilisateur est le crÃ©ateur
    league.is_creator = league.creator_id === req.user.id;

    res.json(league);
  } catch (err) {
    console.error("[GET /api/leagues/:code ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la rÃ©cupÃ©ration de la ligue" });
  }
});

// ============================================
// PATCH /api/leagues/:code - Modifier une ligue (admin only)
// ============================================
router.patch("/:code", authenticateToken, async (req, res) => {
  const { code } = req.params;
  const { name, is_closed } = req.body;

  try {
    // RÃ©cupÃ©rer la ligue
    const leagueResult = await db.query("SELECT * FROM leagues WHERE code = $1", [code.toUpperCase()]);
    const league = leagueResult.rows[0];

    if (!league) {
      return res.status(404).json({ error: "Ligue introuvable" });
    }

    // VÃ©rifier que l'utilisateur est le crÃ©ateur
    if (league.creator_id !== req.user.id) {
      return res.status(403).json({ error: "Seul le crÃ©ateur peut modifier cette ligue" });
    }

    // Interdire de modifier la ligue officielle
    if (league.is_official) {
      return res.status(400).json({ error: "La ligue officielle ne peut pas Ãªtre modifiÃ©e" });
    }

    // Construire la requÃªte de mise Ã  jour
    const updates = [];
    const values = [];

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ error: "Le nom ne peut pas Ãªtre vide" });
      }
      if (trimmedName.length < 3 || trimmedName.length > 50) {
        return res.status(400).json({ error: "Le nom doit contenir entre 3 et 50 caractÃ¨res" });
      }
      updates.push(`name = $${values.length + 1}`);
      values.push(trimmedName);
    }

    if (is_closed !== undefined) {
      updates.push(`is_closed = $${values.length + 1}`);
      values.push(is_closed ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Aucune modification fournie" });
    }

    values.push(league.id);

    await db.query(`
      UPDATE leagues
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
    `, values);

    res.json({ message: "Ligue modifiÃ©e avec succÃ¨s" });
  } catch (err) {
    console.error("[PATCH /api/leagues/:code ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la modification de la ligue" });
  }
});

// ============================================
// GET /api/leagues/:code/leaderboard - Classement d'une ligue
// ============================================
router.get("/:code/leaderboard", authenticateToken, async (req, res) => {
  const { code } = req.params;

  try {
    // VÃ©rifier que la ligue existe
    const leagueResult = await db.query("SELECT id FROM leagues WHERE code = $1", [code.toUpperCase()]);
    const league = leagueResult.rows[0];

    if (!league) {
      return res.status(404).json({ error: "Ligue introuvable" });
    }

    // VÃ©rifier que l'utilisateur est membre
    const isMember = await db.query(
      "SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2",
      [league.id, req.user.id]
    );

    if (!isMember.rows[0]) {
      return res.status(403).json({ error: "Vous n'Ãªtes pas membre de cette ligue" });
    }

    // RÃ©cupÃ©rer le classement
    const leaderboard = await db.query(`
      SELECT 
        u.id,
        u.username,
        ls.total_points,
        lm.joined_at,
        ROW_NUMBER() OVER (ORDER BY ls.total_points DESC) as rank
      FROM league_scores ls
      JOIN users u ON ls.user_id = u.id
      JOIN league_members lm ON ls.league_id = lm.league_id AND ls.user_id = lm.user_id
      WHERE ls.league_id = $1
      ORDER BY ls.total_points DESC
    `, [league.id]);

    res.json(leaderboard.rows);
  } catch (err) {
    console.error("[GET /api/leagues/:code/leaderboard ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la rÃ©cupÃ©ration du classement" });
  }
});

// ============================================
// GET /api/leagues/:code/team/:userId - Voir la composition d'un membre
// ============================================
router.get("/:code/team/:userId", authenticateToken, async (req, res) => {
  const { code, userId } = req.params;

  try {
    // VÃ©rifier que la ligue existe
    const leagueResult = await db.query("SELECT id FROM leagues WHERE code = $1", [code.toUpperCase()]);
    const league = leagueResult.rows[0];

    if (!league) {
      return res.status(404).json({ error: "Ligue introuvable" });
    }

    // VÃ©rifier que l'utilisateur demandeur est membre
    const isMember = await db.query(
      "SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2",
      [league.id, req.user.id]
    );

    if (!isMember.rows[0]) {
      return res.status(403).json({ error: "Vous n'Ãªtes pas membre de cette ligue" });
    }

    // VÃ©rifier que l'utilisateur cible est membre
    const targetIsMember = await db.query(
      "SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2",
      [league.id, userId]
    );

    if (!targetIsMember.rows[0]) {
      return res.status(404).json({ error: "Cet utilisateur n'est pas membre de cette ligue" });
    }

    // RÃ©cupÃ©rer la fantasy team de l'utilisateur cible
    const teamResult = await db.query(`
      SELECT 
        ft.id,
        ft.name as team_name,
        u.username
      FROM fantasy_teams ft
      JOIN users u ON ft.user_id = u.id
      WHERE ft.user_id = $1 AND ft.league_id = $2
      LIMIT 1
    `, [userId, league.id]);

    const team = teamResult.rows[0];

    if (!team) {
      const usernameResult = await db.query("SELECT username FROM users WHERE id = $1", [userId]);
      return res.json({
        username: usernameResult.rows[0]?.username,
        team: null,
        constructors: [],
        drivers: [],
      });
    }

    // Récupérer les écuries (2)
    const constructors = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.price
      FROM fantasy_constructors fc
      JOIN constructors c ON fc.constructor_id = c.id
      WHERE fc.fantasy_team_id = $1
    `, [team.id]);

    // Récupérer les pilotes (5)
    const season = 2026; // Ajouter cette ligne avant la requête

    const drivers = await db.query(`
      SELECT 
        d.id,
        d.name,
        ds.price,
        ds.rookie,
        c.name as constructor_name
      FROM fantasy_picks fp
      JOIN drivers d ON fp.driver_id = d.id
      JOIN driver_seasons ds ON ds.driver_id = d.id AND ds.season = $1
      LEFT JOIN constructors c ON ds.constructor_id = c.id
      WHERE fp.fantasy_team_id = $2
    `, [season, team.id]);

    res.json({
      username: team.username,
      team: {
        name: team.team_name,
      },
      constructors: constructors.rows,
      drivers: drivers.rows,
    });
  } catch (err) {
    console.error("[GET /api/leagues/:code/team/:userId ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la rÃ©cupÃ©ration de l'Ã©quipe" });
  }
});

// ============================================
// DELETE /api/leagues/:code - Supprimer une ligue (admin only)
// ============================================
router.delete("/:code", authenticateToken, async (req, res) => {
  const { code } = req.params;

  try {
    // RÃ©cupÃ©rer la ligue
    const leagueResult = await db.query("SELECT * FROM leagues WHERE code = $1", [code.toUpperCase()]);
    const league = leagueResult.rows[0];

    if (!league) {
      return res.status(404).json({ error: "Ligue introuvable" });
    }

    // VÃ©rifier que l'utilisateur est le crÃ©ateur
    if (league.creator_id !== req.user.id) {
      return res.status(403).json({ error: "Seul le crÃ©ateur peut supprimer cette ligue" });
    }

    // Interdire de supprimer la ligue officielle
    if (league.is_official) {
      return res.status(400).json({ error: "La ligue officielle ne peut pas Ãªtre supprimÃ©e" });
    }

    // Supprimer dans l'ordre (foreign keys)
    // 1. Scores
    await db.query("DELETE FROM league_scores WHERE league_id = $1", [league.id]);
    
    // 2. Membres
    await db.query("DELETE FROM league_members WHERE league_id = $1", [league.id]);
    
    // 3. La ligue elle-mÃªme
    await db.query("DELETE FROM leagues WHERE id = $1", [league.id]);

    console.log(`[DELETE LEAGUE] Ligue ${league.name} (${code}) supprimÃ©e par user ${req.user.id}`);

    res.json({ 
      message: "Ligue supprimÃ©e avec succÃ¨s",
      deleted: true 
    });
  } catch (err) {
    console.error("[DELETE /api/leagues/:code ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la suppression de la ligue" });
  }
});

module.exports = router;