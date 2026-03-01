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
router.get("/:leagueId", authenticateToken, async (req, res) => {
  const { leagueId } = req.params;
  const season = 2026;

  try {
    // Vérifier membre
    const member = await db.query(`
      SELECT id FROM league_members 
      WHERE league_id = $1 AND user_id = $2
    `, [leagueId, req.user.id]);

    if (!member.rows[0]) {
      return res.status(403).json({ error: "Vous n'êtes pas membre" });
    }

    const leagueResult = await db.query(`
      SELECT id, name, code FROM leagues WHERE id = $1
    `, [leagueId]);

    const league = leagueResult.rows[0];

    // Récupérer l'équipe
    const teamResult = await db.query(`
      SELECT id, name, budget FROM fantasy_teams
      WHERE user_id = $1 AND league_id = $2 AND season = $3
    `, [req.user.id, leagueId, season]);

    const team = teamResult.rows[0];

    // Si pas d'équipe, renvoyer structure vide
    if (!team) {
      return res.json({
        team: null,
        league: league ? { id: league.id, name: league.name, code: league.code } : null,
        constructors: [],
        drivers: []
      });
    }

    // Récupérer les écuries
    const constructorsResult = await db.query(`
      SELECT fc.constructor_id, c.name, c.price
      FROM fantasy_constructors fc
      JOIN constructors c ON c.id = fc.constructor_id
      WHERE fc.fantasy_team_id = $1
    `, [team.id]);

    // Récupérer les pilotes
    const driversResult = await db.query(`
      SELECT 
        fp.driver_id,
        fp.is_captain,
        d.name as driver_name,
        ds.price as driver_price,
        c.name as constructor_name
      FROM fantasy_picks fp
      JOIN drivers d ON d.id = fp.driver_id
      JOIN driver_seasons ds ON ds.driver_id = fp.driver_id AND ds.season = $1
      JOIN constructors c ON c.id = ds.constructor_id
      WHERE fp.fantasy_team_id = $2
    `, [season, team.id]);

    res.json({
      team: {
        id: team.id,
        name: team.name,
        budget: team.budget || 100
      },
      league: league ? { id: league.id, name: league.name, code: league.code } : null,
      constructors: constructorsResult.rows,
      drivers: driversResult.rows
    });

  } catch (err) {
    console.error("[GET /api/teams/:leagueId]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// POST /api/teams/:leagueId/validate - Valider
// ============================================
router.post("/:leagueId/validate", authenticateToken, async (req, res) => {
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
    const member = await db.query(`
      SELECT id FROM league_members 
      WHERE league_id = $1 AND user_id = $2
    `, [leagueId, req.user.id]);
    
    if (!member.rows[0]) {
      return res.status(403).json({ error: "Vous n'êtes pas membre" });
    }
    
    // Calculer le budget total
    let totalCost = 0;
    
    // Prix des écuries
    for (const cId of constructorIds) {
      const constructorResult = await db.query("SELECT price FROM constructors WHERE id = $1", [cId]);
      const constructor = constructorResult.rows[0];
      if (!constructor) {
        return res.status(400).json({ error: `Écurie ${cId} introuvable` });
      }
      totalCost += constructor.price;
    }
    
    // Prix des pilotes
    for (const dsId of driverIds) {
      const driverResult = await db.query(`
        SELECT price FROM driver_seasons WHERE driver_id = $1 AND season = $2
      `, [dsId, season]);
      const driver = driverResult.rows[0];
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
    let teamResult = await db.query(`
      SELECT id FROM fantasy_teams
      WHERE user_id = $1 AND league_id = $2 AND season = $3
    `, [req.user.id, leagueId, season]);

    let team = teamResult.rows[0];
    
    const now = new Date().toISOString();
    
    if (team) {
      // Mise à jour
      await db.query(`
        UPDATE fantasy_teams
        SET name = $1, is_validated = 1, validated_at = $2
        WHERE id = $3
      `, [teamName.trim(), now, team.id]);
      
      // Supprimer anciennes sélections
      await db.query("DELETE FROM fantasy_constructors WHERE fantasy_team_id = $1", [team.id]);
      await db.query("DELETE FROM fantasy_picks WHERE fantasy_team_id = $1", [team.id]);
    } else {
      // Création
      const result = await db.query(`
        INSERT INTO fantasy_teams 
          (user_id, league_id, season, name, is_validated, validated_at)
        VALUES ($1, $2, $3, $4, 1, $5)
        RETURNING id
      `, [req.user.id, leagueId, season, teamName.trim(), now]);
      
      team = { id: result.rows[0].id };
    }
    
    // Ajouter les écuries
    for (const cId of constructorIds) {
      await db.query(`
        INSERT INTO fantasy_constructors (fantasy_team_id, constructor_id)
        VALUES ($1, $2)
      `, [team.id, cId]);
    }
    
    // Ajouter les pilotes
    for (const driverId of driverIds) {
      await db.query(`
        INSERT INTO fantasy_picks (fantasy_team_id, driver_id, season)
        VALUES ($1, $2, $3)
      `, [team.id, driverId, season]);
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
router.patch("/:leagueId/name", authenticateToken, async (req, res) => {
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
    
    const member = await db.query(`
      SELECT id FROM league_members 
      WHERE league_id = $1 AND user_id = $2
    `, [leagueId, req.user.id]);

    if (!member.rows[0]) {
      console.log(`[PATCH /name] User not member of league ${leagueId}`);
      return res.status(403).json({ error: "Vous n'êtes pas membre de cette ligue" });
    }

    console.log(`[PATCH /name] Step 2: User ${req.user.id}, League ${leagueId}, Name: "${name}"`);

    // Vérifier que le nom n'est pas déjà pris dans cette ligue (insensible à la casse)
    console.log(`[PATCH /name] Step 3: Checking for duplicate name`);
    
    const existingTeamResult = await db.query(`
      SELECT ft.id, u.username
      FROM fantasy_teams ft
      JOIN users u ON ft.user_id = u.id
      WHERE ft.league_id = $1 
        AND ft.season = $2 
        AND LOWER(ft.name) = LOWER($3) 
        AND ft.user_id != $4
    `, [leagueId, season, name, req.user.id]);

    const existingTeam = existingTeamResult.rows[0];

    if (existingTeam) {
      console.log(`[PATCH /name] Nom déjà pris par ${existingTeam.username}`);
      return res.status(400).json({ 
        error: `Le nom "${name}" est déjà utilisé par ${existingTeam.username} dans cette ligue` 
      });
    }

    // Vérifier si l'équipe existe
    console.log(`[PATCH /name] Step 4: Checking if team exists`);
    
    let teamResult = await db.query(`
      SELECT id FROM fantasy_teams
      WHERE user_id = $1 AND league_id = $2 AND season = $3
    `, [req.user.id, leagueId, season]);

    let team = teamResult.rows[0];

    if (!team) {
      // Créer l'équipe si elle n'existe pas
      console.log(`[PATCH /name] Step 5: Creating new team`);
      
      try {
        const result = await db.query(`
          INSERT INTO fantasy_teams (user_id, league_id, season, name)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [req.user.id, leagueId, season, name]);
        
        team = { id: result.rows[0].id };
        console.log(`[CREATE TEAM] ✅ User ${req.user.id} - League ${leagueId} - Team ${team.id} created with name: "${name}"`);
      } catch (insertErr) {
        console.error(`[CREATE TEAM] ❌ SQL INSERT ERROR:`, insertErr);
        throw new Error(`Erreur création équipe: ${insertErr.message}`);
      }
    } else {
      // Mettre à jour le nom
      console.log(`[PATCH /name] Step 5: Updating existing team ${team.id}`);
      
      try {
        await db.query(`
          UPDATE fantasy_teams
          SET name = $1
          WHERE id = $2
        `, [name, team.id]);
        
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
router.post("/:leagueId/save", authenticateToken, async (req, res) => {
  const { leagueId } = req.params;
  const { teamName, constructorIds, driverIds, captainDriverId } = req.body;
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
    const member = await db.query(`
      SELECT id FROM league_members 
      WHERE league_id = $1 AND user_id = $2
    `, [leagueId, req.user.id]);

    if (!member.rows[0]) {
      return res.status(403).json({ error: "Vous n'êtes pas membre de cette ligue" });
    }

    // Vérifier que l'équipe existe
    let teamResult = await db.query(`
      SELECT id FROM fantasy_teams
      WHERE user_id = $1 AND league_id = $2 AND season = $3
    `, [req.user.id, leagueId, season]);

    let team = teamResult.rows[0];

    if (!team) {
      // Créer l'équipe
      const result = await db.query(`
        INSERT INTO fantasy_teams (user_id, league_id, season, name, is_validated, validated_at)
        VALUES ($1, $2, $3, $4, 0, NULL)
        RETURNING id
      `, [req.user.id, leagueId, season, teamName.trim()]);
      
      team = { id: result.rows[0].id };
    } else {
      // Mettre à jour le nom
      await db.query(`
        UPDATE fantasy_teams SET name = $1 WHERE id = $2
      `, [teamName.trim(), team.id]);
    }

    // Supprimer anciennes sélections
    await db.query(`DELETE FROM fantasy_constructors WHERE fantasy_team_id = $1`, [team.id]);
    await db.query(`DELETE FROM fantasy_picks WHERE fantasy_team_id = $1`, [team.id]);

    // Insérer les nouvelles écuries
    for (const cId of constructorIds) {
      await db.query(`
        INSERT INTO fantasy_constructors (fantasy_team_id, constructor_id)
        VALUES ($1, $2)
      `, [team.id, cId]);
    }

    // Insérer les nouveaux pilotes avec capitaine
    for (const driverId of driverIds) {
      const isCaptain = driverId === captainDriverId ? 1 : 0;
      
      await db.query(`
        INSERT INTO fantasy_picks (fantasy_team_id, driver_id, season, is_captain)
        VALUES ($1, $2, $3, $4)
      `, [team.id, driverId, season, isCaptain]);
    }

    // Calculer le coût total
    const constructorsCostResult = await db.query(`
      SELECT SUM(c.price) as total
      FROM fantasy_constructors fc
      JOIN constructors c ON fc.constructor_id = c.id
      WHERE fc.fantasy_team_id = $1
    `, [team.id]);

    const driversCostResult = await db.query(`
      SELECT SUM(ds.price) as total
      FROM fantasy_picks fp
      JOIN driver_seasons ds ON fp.driver_id = ds.driver_id AND ds.season = $1
      WHERE fp.fantasy_team_id = $2
    `, [season, team.id]);

    const totalCost = (constructorsCostResult.rows[0]?.total || 0) + (driversCostResult.rows[0]?.total || 0);

    const checkInitialResult = await db.query(`
      SELECT initial_spent FROM fantasy_teams WHERE id = $1
    `, [team.id]);

    if (!checkInitialResult.rows[0]?.initial_spent || checkInitialResult.rows[0].initial_spent === 0) {
      await recordInitialSpent(team.id);
      console.log(`[SAVE] initial_spent enregistré pour team ${team.id}: ${totalCost.toFixed(1)}M`); // ✅ Parenthèses
    }

    console.log(`[SAVE] User ${req.user.id} - League ${leagueId} - Team ${team.id} - Cost ${totalCost.toFixed(1)}M`); // ✅ Parenthèses, pas de duplication

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
router.get("/:leagueId/deadline-status", authenticateToken, async (req, res) => {
  const { leagueId } = req.params;
  const season = 2026;

  try {
    const member = await db.query(`
      SELECT id FROM league_members 
      WHERE league_id = $1 AND user_id = $2
    `, [leagueId, req.user.id]);

    if (!member.rows[0]) {
      return res.status(403).json({ error: "Vous n'êtes pas membre de cette ligue" });
    }

    const now = new Date();
    
    // Chercher le weekend ACTIF (lock passé, mais unlock pas encore passé)
    const activeWeekendResult = await db.query(`
      SELECT id, round, name, lock_deadline, unlock_at
      FROM race_weekends
      WHERE season = $1 
        AND lock_deadline <= $2
        AND unlock_at > $2
      ORDER BY round ASC
      LIMIT 1
    `, [season, now.toISOString()]);

    const activeWeekend = activeWeekendResult.rows[0];

    if (activeWeekend) {
      // Weekend EN COURS = LOCKED
      const unlockDate = new Date(activeWeekend.unlock_at);
      const hoursUntilUnlock = (unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      const formatTime = (hours) => {
        if (hours < 1) return `${Math.floor(hours * 60)}min`;
        if (hours < 24) return `${Math.floor(hours)}h`;
        return `${Math.floor(hours / 24)}j`;
      };

      return res.json({
        state: "locked",
        canEdit: false,
        deadline: activeWeekend.lock_deadline,
        unlockAt: activeWeekend.unlock_at,
        weekendName: activeWeekend.name,
        round: activeWeekend.round,
        timeRemaining: formatTime(hoursUntilUnlock)
      });
    }

    // Sinon, chercher le PROCHAIN weekend
    const nextWeekendResult = await db.query(`
      SELECT id, round, name, lock_deadline
      FROM race_weekends
      WHERE season = $1 AND lock_deadline > $2
      ORDER BY lock_deadline ASC
      LIMIT 1
    `, [season, now.toISOString()]);

    const nextWeekend = nextWeekendResult.rows[0];

    if (!nextWeekend) {
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
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    let state = "open";
    if (hoursUntilDeadline < 24) state = "urgent";

    const formatTime = (hours) => {
      if (hours < 1) return `${Math.floor(hours * 60)}min`;
      if (hours < 24) return `${Math.floor(hours)}h`;
      return `${Math.floor(hours / 24)}j`;
    };

    res.json({
      state,
      canEdit: true,
      deadline: nextWeekend.lock_deadline,
      unlockAt: null,
      weekendName: nextWeekend.name,
      round: nextWeekend.round,
      timeRemaining: formatTime(hoursUntilDeadline)
    });

  } catch (err) {
    console.error("[GET /api/teams/:leagueId/deadline-status]", err);
    res.status(500).json({ error: "Erreur" });
  }
});

module.exports = router;