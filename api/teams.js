const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./auth");
const { recordInitialSpent } = require("../logic/budget-manager");

const JWT_SECRET = process.env.JWT_SECRET;

// ============================================
// GET /api/teams/:leagueId - Récupérer l'équipe
// ============================================
router.get("/:leagueId", authenticateToken, (req, res) => {
  const { leagueId } = req.params;
  const season = 2026;

  try {
    // Vérifier membre
    const member = db.prepare(`
      SELECT id FROM league_members 
      WHERE league_id = ? AND user_id = ?
    `).get(leagueId, req.user.id);

    if (!member) {
      return res.status(403).json({ error: "Vous n'êtes pas membre" });
    }

    const league = db.prepare(`
      SELECT id, name FROM leagues WHERE id = ?
    `).get(leagueId);

    // Récupérer l'équipe
    const team = db.prepare(`
      SELECT id, name, budget FROM fantasy_teams
      WHERE user_id = ? AND league_id = ? AND season = ?
    `).get(req.user.id, leagueId, season);

    // Si pas d'équipe, renvoyer structure vide
    if (!team) {
      return res.json({
        team: null,
        league: league ? { id: league.id, name: league.name } : null,
        constructors: [],
        drivers: []
      });
    }

    // Récupérer les écuries
    const constructors = db.prepare(`
      SELECT fc.constructor_id, c.name, c.price
      FROM fantasy_constructors fc
      JOIN constructors c ON c.id = fc.constructor_id
      WHERE fc.fantasy_team_id = ?
    `).all(team.id);

    // Récupérer les pilotes
    const drivers = db.prepare(`
      SELECT 
        fp.driver_id,
        d.name as driver_name,
        ds.price as driver_price,
        c.name as constructor_name
      FROM fantasy_picks fp
      JOIN drivers d ON d.id = fp.driver_id
      JOIN driver_seasons ds ON ds.driver_id = fp.driver_id AND ds.season = ?
      JOIN constructors c ON c.id = ds.constructor_id
      WHERE fp.fantasy_team_id = ?
    `).all(season, team.id);

    res.json({
      team: {
        id: team.id,
        name: team.name,
        budget: team.budget || 100 // ✅ 28: Budget dynamique
      },
      league: league ? { id: league.id, name: league.name } : null, // ✅ 19
      constructors,
      drivers
    });

  } catch (err) {
    console.error("[GET /api/teams/:leagueId]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// POST /api/teams/:leagueId/validate - Valider
// ============================================
router.post("/:leagueId/validate", authenticateToken, (req, res) => {
  const { leagueId } = req.params;
  const { teamName, constructorIds, driverIds } = req.body;
  const season = 2026;
  
  try {
    // Validations
    if (!teamName?.trim()) {
      return res.status(400).json({ error: "Le nom de l'équipe est requis" });
    }
    if (!constructorIds || constructorIds.length !== 2) {
      return res.status(400).json({ error: "Sélectionne exactement 2 écuries" });
    }
    if (!driverIds || driverIds.length !== 5) {
      return res.status(400).json({ error: "Sélectionne exactement 5 pilotes" });
    }
    
    // Vérifier membre
    const member = db.prepare(`
      SELECT id FROM league_members 
      WHERE league_id = ? AND user_id = ?
    `).get(leagueId, req.user.id);
    
    if (!member) {
      return res.status(403).json({ error: "Vous n'êtes pas membre" });
    }
    
    // Calculer le budget total
    let totalCost = 0;
    
    // Prix des écuries
    for (const cId of constructorIds) {
      const constructor = db.prepare("SELECT price FROM constructors WHERE id = ?").get(cId);
      if (!constructor) {
        return res.status(400).json({ error: `Écurie ${cId} introuvable` });
      }
      totalCost += constructor.price;
    }
    
    // Prix des pilotes
    for (const dsId of driverIds) {
      const driver = db.prepare(`
        SELECT price FROM driver_seasons WHERE driver_id = ? AND season = ?
      `).get(dsId, season);
      if (!driver) {
        return res.status(400).json({ error: `Pilote ${dsId} introuvable` });
      }
      totalCost += driver.price;
    }
    
    // Vérifier budget
    if (totalCost > 100) {
      return res.status(400).json({ 
        error: `Budget dépassé : ${totalCost.toFixed(1)}M / 100M` 
      });
    }
    
    // Créer ou mettre à jour l'équipe + VALIDER
    let team = db.prepare(`
      SELECT id FROM fantasy_teams
      WHERE user_id = ? AND league_id = ? AND season = ?
    `).get(req.user.id, leagueId, season);
    
    const now = new Date().toISOString();
    
    if (team) {
      // Mise à jour
      db.prepare(`
        UPDATE fantasy_teams
        SET name = ?, is_validated = 1, validated_at = ?
        WHERE id = ?
      `).run(teamName.trim(), now, team.id);
      
      // Supprimer anciennes sélections
      db.prepare("DELETE FROM fantasy_constructors WHERE fantasy_team_id = ?").run(team.id);
      db.prepare("DELETE FROM fantasy_picks WHERE fantasy_team_id = ?").run(team.id);
    } else {
      // Création
      const result = db.prepare(`
        INSERT INTO fantasy_teams 
          (user_id, league_id, season, name, is_validated, validated_at)
        VALUES (?, ?, ?, ?, 1, ?)
      `).run(req.user.id, leagueId, season, teamName.trim(), now);
      
      team = { id: result.lastInsertRowid };
    }
    
    // Ajouter les écuries
    const insertConstructor = db.prepare(`
      INSERT INTO fantasy_constructors (fantasy_team_id, constructor_id)
      VALUES (?, ?)
    `);
    
    for (const cId of constructorIds) {
      insertConstructor.run(team.id, cId);
    }
    
    // Ajouter les pilotes
    const insertPick = db.prepare(`
      INSERT INTO fantasy_picks (fantasy_team_id, driver_id, season)
      VALUES (?, ?, ?)
    `);
    
    for (const driverId of driverIds) {
      insertPick.run(team.id, driverId, season);
    }
    
    recordInitialSpent(team.id);    
    console.log(`[VALIDATE] User ${req.user.id} - League ${leagueId} - Team ${team.id} - Cost ${totalCost.toFixed(1)}M`);
    
    res.json({ 
      message: "Équipe validée avec succès !", 
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
router.patch("/:leagueId/name", authenticateToken, (req, res) => {
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
          INSERT INTO fantasy_teams (user_id, league_id, season, name)
          VALUES (?, ?, ?, ?)
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

// ============================================
// POST /api/teams/:leagueId/save - Sauvegarde automatique
// ============================================
router.post("/:leagueId/save", authenticateToken, (req, res) => {
  const { leagueId } = req.params;
  const { teamName, constructorIds, driverIds } = req.body;
  const season = 2026;

  // Validation basique
  if (!teamName || teamName.trim().length < 3) {
    return res.status(400).json({ error: "Nom d'équipe invalide (min 3 caractères)" });
  }

  if (!Array.isArray(constructorIds) || constructorIds.length !== 2) {
    return res.status(400).json({ error: "Il faut exactement 2 écuries" });
  }

  if (!Array.isArray(driverIds) || driverIds.length !== 5) {
    return res.status(400).json({ error: "Il faut exactement 5 pilotes" });
  }

  try {
    // Vérifier membre
    const member = db.prepare(`
      SELECT id FROM league_members 
      WHERE league_id = ? AND user_id = ?
    `).get(leagueId, req.user.id);

    if (!member) {
      return res.status(403).json({ error: "Vous n'êtes pas membre de cette ligue" });
    }

    // Vérifier que l'équipe existe
    let team = db.prepare(`
      SELECT id FROM fantasy_teams
      WHERE user_id = ? AND league_id = ? AND season = ?
    `).get(req.user.id, leagueId, season);

    if (!team) {
      // Créer l'équipe
      const result = db.prepare(`
        INSERT INTO fantasy_teams (user_id, league_id, season, name, is_validated, validated_at)
        VALUES (?, ?, ?, ?, 0, NULL)
      `).run(req.user.id, leagueId, season, teamName.trim());
      
      team = { id: result.lastInsertRowid };
    } else {
      // Mettre à jour le nom
      db.prepare(`
        UPDATE fantasy_teams SET name = ? WHERE id = ?
      `).run(teamName.trim(), team.id);
    }

    // Supprimer anciennes sélections
    db.prepare(`DELETE FROM fantasy_constructors WHERE fantasy_team_id = ?`).run(team.id);
    db.prepare(`DELETE FROM fantasy_picks WHERE fantasy_team_id = ?`).run(team.id);

    // Insérer les nouvelles écuries
    const insertConstructor = db.prepare(`
      INSERT INTO fantasy_constructors (fantasy_team_id, constructor_id)
      VALUES (?, ?)
    `);
    for (const cId of constructorIds) {
      insertConstructor.run(team.id, cId);
    }

    // Insérer les nouveaux pilotes
    const insertPick = db.prepare(`
      INSERT INTO fantasy_picks (fantasy_team_id, driver_id, season)
      VALUES (?, ?, ?)
    `);
    for (const driverId of driverIds) {
      insertPick.run(team.id, driverId, season);
    }

    // Calculer le coût total
    const constructorsCost = db.prepare(`
      SELECT SUM(c.price) as total
      FROM fantasy_constructors fc
      JOIN constructors c ON fc.constructor_id = c.id
      WHERE fc.fantasy_team_id = ?
    `).get(team.id);

    const driversCost = db.prepare(`
      SELECT SUM(ds.price) as total
      FROM fantasy_picks fp
      JOIN driver_seasons ds ON fp.driver_id = ds.driver_id AND ds.season = ?
      WHERE fp.fantasy_team_id = ?
    `).get(season, team.id);

    const totalCost = (constructorsCost?.total || 0) + (driversCost?.total || 0);

    console.log(`[SAVE] User ${req.user.id} - League ${leagueId} - Team ${team.id} - Cost ${totalCost.toFixed(1)}M`);

    res.json({ 
      message: "Équipe sauvegardée",
      teamId: team.id,
      totalCost: totalCost.toFixed(1)
    });

  } catch (err) {
    console.error("[POST /api/teams/:leagueId/save]", err);
    res.status(500).json({ error: "Erreur sauvegarde" });
  }
});

// ============================================
// GET /api/teams/:leagueId/deadline-status - Statut de la deadline
// ============================================
router.get("/:leagueId/deadline-status", authenticateToken, (req, res) => {
  const { leagueId } = req.params;
  const season = 2026;

  try {
    // Vérifier membre
    const member = db.prepare(`
      SELECT id FROM league_members 
      WHERE league_id = ? AND user_id = ?
    `).get(leagueId, req.user.id);

    if (!member) {
      return res.status(403).json({ error: "Vous n'êtes pas membre de cette ligue" });
    }

    // Récupérer le prochain weekend
    const now = new Date().toISOString();
    const nextWeekend = db.prepare(`
      SELECT id, round, name, lock_deadline
      FROM race_weekends
      WHERE season = ? AND lock_deadline > ?
      ORDER BY lock_deadline ASC
      LIMIT 1
    `).get(season, now);

    if (!nextWeekend || !nextWeekend.lock_deadline) {
      // Pas de deadline à venir
      return res.json({
        state: "open",
        canEdit: true,
        deadline: null,
        unlockAt: null,
        weekendName: null,
        timeRemaining: null
      });
    }

    const deadline = new Date(nextWeekend.lock_deadline);
    const nowDate = new Date();
    const hoursUntilDeadline = (deadline.getTime() - nowDate.getTime()) / (1000 * 60 * 60);

    // Déterminer l'état
    let state = "open";
    let canEdit = true;

    if (hoursUntilDeadline < 0) {
      // Deadline passée = locked
      state = "locked";
      canEdit = false;
    } else if (hoursUntilDeadline < 24) {
      // Moins de 24h = urgent
      state = "urgent";
      canEdit = true;
    }

    // Calculer le temps restant
    const formatTimeRemaining = (hours) => {
      if (hours < 1) {
        return `${Math.floor(hours * 60)}min`;
      } else if (hours < 24) {
        return `${Math.floor(hours)}h`;
      } else {
        return `${Math.floor(hours / 24)}j`;
      }
    };

    res.json({
      state,
      canEdit,
      deadline: nextWeekend.lock_deadline,
      unlockAt: null, // TODO: implémenter unlock_at si besoin
      weekendName: nextWeekend.name,
      round: nextWeekend.round,
      timeRemaining: hoursUntilDeadline > 0 ? formatTimeRemaining(hoursUntilDeadline) : null
    });

  } catch (err) {
    console.error("[GET /api/teams/:leagueId/deadline-status]", err);
    res.status(500).json({ error: "Erreur" });
  }
});

module.exports = router;