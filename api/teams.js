const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware auth
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

// ============================================
// GET /api/teams/:leagueId - RÃ©cupÃ©rer l'Ã©quipe
// ============================================
router.get("/:leagueId", auth, (req, res) => {
  const { leagueId } = req.params;
  const season = 2026;

  try {
    // VÃ©rifier membre de la ligue
    const member = db.prepare(`
      SELECT id FROM league_members 
      WHERE league_id = ? AND user_id = ?
    `).get(leagueId, req.user.id);

    if (!member) {
      return res.status(403).json({ error: "Vous n'Ãªtes pas membre de cette ligue" });
    }

    // RÃ©cupÃ©rer l'Ã©quipe
    const team = db.prepare(`
      SELECT * FROM fantasy_teams
      WHERE user_id = ? AND league_id = ? AND season = ?
    `).get(req.user.id, leagueId, season);

    if (!team) {
      return res.json({ 
        team: null, 
        drivers: [], 
        constructors: [] 
      });
    }

    // RÃ©cupÃ©rer les pilotes sÃ©lectionnÃ©s
    const drivers = db.prepare(`
      SELECT 
        ds.id as driver_season_id,
        d.id as driver_id,
        d.name as driver_name,
        ds.price as driver_price,
        ds.rookie,
        c.name as constructor_name
      FROM fantasy_picks fp
      JOIN driver_seasons ds ON fp.driver_season_id = ds.id
      JOIN drivers d ON ds.driver_id = d.id
      LEFT JOIN constructors c ON ds.constructor_id = c.id
      WHERE fp.fantasy_team_id = ?
    `).all(team.id);

    // RÃ©cupÃ©rer les Ã©curies sÃ©lectionnÃ©es
    const constructors = db.prepare(`
      SELECT 
        c.id as constructor_id,
        c.name as constructor_name,
        c.price as constructor_price,
        c.slug
      FROM fantasy_constructors fc
      JOIN constructors c ON fc.constructor_id = c.id
      WHERE fc.fantasy_team_id = ?
    `).all(team.id);

    res.json({ team, drivers, constructors });
  } catch (err) {
    console.error("[GET /api/teams/:leagueId]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// POST /api/teams/:leagueId/validate - Valider
// ============================================
router.post("/:leagueId/validate", auth, (req, res) => {
  const { leagueId } = req.params;
  const { teamName, constructorIds, driverSeasonIds } = req.body;
  const season = 2026;

  try {
    // Validations
    if (!teamName?.trim()) {
      return res.status(400).json({ error: "Le nom de l'Ã©quipe est requis" });
    }
    if (!constructorIds || constructorIds.length !== 2) {
      return res.status(400).json({ error: "SÃ©lectionne exactement 2 Ã©curies" });
    }
    if (!driverSeasonIds || driverSeasonIds.length !== 5) {
      return res.status(400).json({ error: "SÃ©lectionne exactement 5 pilotes" });
    }

    // VÃ©rifier membre
    const member = db.prepare(`
      SELECT id FROM league_members 
      WHERE league_id = ? AND user_id = ?
    `).get(leagueId, req.user.id);

    if (!member) {
      return res.status(403).json({ error: "Vous n'Ãªtes pas membre" });
    }

    // Calculer le budget total
    let totalCost = 0;
    
    // Prix des Ã©curies
    for (const cId of constructorIds) {
      const constructor = db.prepare("SELECT price FROM constructors WHERE id = ?").get(cId);
      if (!constructor) {
        return res.status(400).json({ error: `Ã‰curie ${cId} introuvable` });
      }
      totalCost += constructor.price;
    }
    
    // Prix des pilotes
    for (const dsId of driverSeasonIds) {
      const driver = db.prepare(`
        SELECT price FROM driver_seasons WHERE id = ? AND season = ?
      `).get(dsId, season);
      if (!driver) {
        return res.status(400).json({ error: `Pilote ${dsId} introuvable` });
      }
      totalCost += driver.price;
    }
    
    // VÃ©rifier budget
    if (totalCost > 100) {
      return res.status(400).json({ 
        error: `Budget dÃ©passÃ© : ${totalCost.toFixed(1)}M / 100M` 
      });
    }
    
    // CrÃ©er ou mettre Ã  jour l'Ã©quipe + VALIDER
    let team = db.prepare(`
      SELECT id FROM fantasy_teams
      WHERE user_id = ? AND league_id = ? AND season = ?
    `).get(req.user.id, leagueId, season);

    const now = new Date().toISOString();

    if (team) {
      // Mise Ã  jour
      db.prepare(`
        UPDATE fantasy_teams
        SET name = ?, is_validated = 1, validated_at = ?
        WHERE id = ?
      `).run(teamName.trim(), now, team.id);
      
      // Supprimer anciennes sÃ©lections
      db.prepare("DELETE FROM fantasy_constructors WHERE fantasy_team_id = ?").run(team.id);
      db.prepare("DELETE FROM fantasy_picks WHERE fantasy_team_id = ?").run(team.id);
    } else {
      // CrÃ©ation
      const result = db.prepare(`
        INSERT INTO fantasy_teams 
          (user_id, league_id, season, name, is_validated, validated_at)
        VALUES (?, ?, ?, ?, 1, ?)
      `).run(req.user.id, leagueId, season, teamName.trim(), now);
      
      team = { id: result.lastInsertRowid };
    }

    // Ajouter les Ã©curies
    const insertConstructor = db.prepare(`
      INSERT INTO fantasy_constructors (fantasy_team_id, constructor_id)
      VALUES (?, ?)
    `);
    
    for (const cId of constructorIds) {
      insertConstructor.run(team.id, cId);
    }

    // Ajouter les pilotes
    const insertPick = db.prepare(`
      INSERT INTO fantasy_picks (fantasy_team_id, driver_season_id)
      VALUES (?, ?)
    `);
    
    for (const dsId of driverSeasonIds) {
      insertPick.run(team.id, dsId);
    }

    console.log(`[VALIDATE] User ${req.user.id} - League ${leagueId} - Team ${team.id} - Cost ${totalCost.toFixed(1)}M`);

    res.json({ 
      message: "Ã‰quipe validÃ©e avec succÃ¨s !", 
      teamId: team.id,
      totalCost: totalCost.toFixed(1)
    });
  } catch (err) {
    console.error("[POST /api/teams/:leagueId/validate]", err);
    res.status(500).json({ error: "Erreur validation" });
  }
});

// ============================================
// PATCH /api/teams/:leagueId/name - Modifier le nom
// ============================================
router.patch("/:leagueId/name", auth, (req, res) => {
  const { leagueId } = req.params;
  let { name } = req.body;
  const season = 2026;

  name = (name ?? "").trim();

  // Validation
  if (!name) {
    return res.status(400).json({ error: "Le nom est requis" });
  }

  if (name.length < 3) {
    return res.status(400).json({ error: "Le nom doit contenir au moins 3 caractères" });
  }

  if (name.length > 20) {
    return res.status(400).json({ error: "Le nom ne doit pas dépasser 20 caractères" });
  }

  try {
    // Vérifier membre
    console.log(`[PATCH /name] Step 1: Checking membership - User ${req.user.id}, League ${leagueId}`);
    
    const member = db.prepare(`
      SELECT id FROM league_members 
      WHERE league_id = ? AND user_id = ?
    `).get(leagueId, req.user.id);

    if (!member) {
      console.log(`[PATCH /name] User not member of league ${leagueId}`);
      return res.status(403).json({ error: "Vous n'êtes pas membre de cette ligue" });
    }

    console.log(`[PATCH /name] Step 2: User ${req.user.id}, League ${leagueId}, Name: "${name}"`);

    // Vérifier que le nom n'est pas déjà pris dans cette ligue (insensible à la casse)
    console.log(`[PATCH /name] Step 3: Checking for duplicate name`);
    
    const existingTeam = db.prepare(`
      SELECT ft.id, u.username
      FROM fantasy_teams ft
      JOIN users u ON ft.user_id = u.id
      WHERE ft.league_id = ? 
        AND ft.season = ? 
        AND LOWER(ft.name) = LOWER(?) 
        AND ft.user_id != ?
    `).get(leagueId, season, name, req.user.id);

    if (existingTeam) {
      console.log(`[PATCH /name] Nom déjà pris par ${existingTeam.username}`);
      return res.status(400).json({ 
        error: `Le nom "${name}" est déjà utilisé par ${existingTeam.username} dans cette ligue` 
      });
    }

    // Vérifier si l'équipe existe
    console.log(`[PATCH /name] Step 4: Checking if team exists`);
    
    let team = db.prepare(`
      SELECT id FROM fantasy_teams
      WHERE user_id = ? AND league_id = ? AND season = ?
    `).get(req.user.id, leagueId, season);

    if (!team) {
      // Créer l'équipe si elle n'existe pas
      console.log(`[PATCH /name] Step 5: Creating new team`);
      
      try {
        const result = db.prepare(`
          INSERT INTO fantasy_teams (user_id, league_id, season, name, is_validated, validated_at)
          VALUES (?, ?, ?, ?, 0, NULL)
        `).run(req.user.id, leagueId, season, name);
        
        team = { id: result.lastInsertRowid };
        console.log(`[CREATE TEAM] ✅ User ${req.user.id} - League ${leagueId} - Team ${team.id} created with name: "${name}"`);
      } catch (insertErr) {
        console.error(`[CREATE TEAM] ❌ SQL INSERT ERROR:`, insertErr);
        throw new Error(`Erreur création équipe: ${insertErr.message}`);
      }
    } else {
      // Mettre à jour le nom
      console.log(`[PATCH /name] Step 5: Updating existing team ${team.id}`);
      
      try {
        db.prepare(`
          UPDATE fantasy_teams
          SET name = ?
          WHERE id = ?
        `).run(name, team.id);
        
        console.log(`[UPDATE NAME] ✅ User ${req.user.id} - League ${leagueId} - Team ${team.id} - New name: "${name}"`);
      } catch (updateErr) {
        console.error(`[UPDATE NAME] ❌ SQL UPDATE ERROR:`, updateErr);
        throw new Error(`Erreur mise à jour nom: ${updateErr.message}`);
      }
    }

    res.json({ 
      message: "Nom modifié avec succès",
      name 
    });

  } catch (err) {
    console.error("[PATCH /api/teams/:leagueId/name] ❌ GLOBAL ERROR:", err);
    res.status(500).json({ 
      error: err?.message || "Erreur serveur" 
    });
  }
});

module.exports = router;