const db = require("../db");

const BUDGET_MAX = 200.0;

/**
 * Calcule le budget actuel d'une équipe
 * Budget = Valeur actuelle équipe + Budget non dépensé initial
 */
async function calculateTeamBudget(teamId, season) {
  // 1. Récupérer l'équipe et son budget non dépensé
  const teamResult = await db.query(`
    SELECT budget, initial_spent 
    FROM fantasy_teams 
    WHERE id = $1
  `, [teamId]);

  const team = teamResult.rows[0];

  if (!team) {
    throw new Error(`Team ${teamId} not found`);
  }

  const budgetNonDepense = Math.round((100.0 - team.initial_spent) * 100) / 100;

  // 2. Récupérer les 5 pilotes de l'équipe
  const driversResult = await db.query(`
    SELECT ds.price
    FROM fantasy_picks fp
    JOIN driver_seasons ds ON ds.driver_id = fp.driver_id AND ds.season = $1
    WHERE fp.fantasy_team_id = $2
  `, [season, teamId]);

  const drivers = driversResult.rows;

  // 3. Récupérer les 2 écuries de l'équipe
  const constructorsResult = await db.query(`
    SELECT c.price
    FROM fantasy_team_constructors ftc
    JOIN constructors c ON c.id = ftc.constructor_id
    WHERE ftc.fantasy_team_id = $1
  `, [teamId]);

  const constructors = constructorsResult.rows;

  // 4. Calculer la valeur actuelle de l'équipe
  const valeurPilotes = drivers.reduce((sum, d) => sum + d.price, 0);
  const valeurEcuries = constructors.reduce((sum, c) => sum + c.price, 0);
  const valeurEquipe = valeurPilotes + valeurEcuries;

  // 5. Nouveau budget = Valeur équipe + Budget non dépensé
  let nouveauBudget = valeurEquipe + budgetNonDepense;

  // 6. Plafonner à 200M
  nouveauBudget = Math.min(nouveauBudget, BUDGET_MAX);
  nouveauBudget = Math.round(nouveauBudget * 100) / 100;

  return {
    teamId,
    valeurPilotes,
    valeurEcuries,
    valeurEquipe,
    budgetNonDepense,
    ancienBudget: team.budget,
    nouveauBudget,
    difference: nouveauBudget - team.budget
  };
}

/**
 * Met à jour le budget d'une équipe
 */
async function updateTeamBudget(teamId, season) {
  const result = await calculateTeamBudget(teamId, season);

  await db.query(`
    UPDATE fantasy_teams 
    SET budget = $1 
    WHERE id = $2
  `, [result.nouveauBudget, teamId]);

  return result;
}

/**
 * Met à jour tous les budgets pour une saison donnée
 */
async function updateAllTeamBudgets(season) {
  const teamsResult = await db.query(`
    SELECT id 
    FROM fantasy_teams 
    WHERE season = $1 AND is_validated = 1
  `, [season]);

  const teams = teamsResult.rows;

  const results = [];

  for (const team of teams) {
    try {
      const result = await updateTeamBudget(team.id, season);
      results.push(result);
      console.log(`Team ${team.id}: ${result.ancienBudget.toFixed(1)}M → ${result.nouveauBudget.toFixed(1)}M (${result.difference >= 0 ? '+' : ''}${result.difference.toFixed(1)}M)`);
    } catch (err) {
      console.error(`Erreur team ${team.id}:`, err.message);
    }
  }

  return results;
}

/**
 * Enregistre le coût initial d'une équipe lors de sa validation
 */
async function recordInitialSpent(teamId) {
  const teamResult = await db.query(`SELECT id FROM fantasy_teams WHERE id = $1`, [teamId]);

  const team = teamResult.rows[0];
  
  if (!team) {
    throw new Error(`Team ${teamId} not found`);
  }

  // Récupérer le coût actuel de l'équipe
  const seasonResult = await db.query(`SELECT season FROM fantasy_teams WHERE id = $1`, [teamId]);
  const season = seasonResult.rows[0].season;
  
  const driversResult = await db.query(`
    SELECT ds.price
    FROM fantasy_picks fp
    JOIN driver_seasons ds ON ds.driver_id = fp.driver_id AND ds.season = $1
    WHERE fp.fantasy_team_id = $2
  `, [season, teamId]);

  const drivers = driversResult.rows;

  const constructorsResult = await db.query(`
    SELECT c.price
    FROM fantasy_team_constructors ftc
    JOIN constructors c ON c.id = ftc.constructor_id
    WHERE ftc.fantasy_team_id = $1
  `, [teamId]);

  const constructors = constructorsResult.rows;

  const totalCost = 
    drivers.reduce((sum, d) => sum + d.price, 0) +
    constructors.reduce((sum, c) => sum + c.price, 0);

  const totalCostRounded = Math.round(totalCost * 100) / 100;

  // Enregistrer le coût initial
  await db.query(`
    UPDATE fantasy_teams 
    SET initial_spent = $1 
    WHERE id = $2
  `, [totalCostRounded, teamId]);

  console.log(`Team ${teamId}: Coût initial enregistré = ${totalCostRounded.toFixed(1)}M`);

  return totalCostRounded;
}

module.exports = {
  calculateTeamBudget,
  updateTeamBudget,
  updateAllTeamBudgets,
  recordInitialSpent
};