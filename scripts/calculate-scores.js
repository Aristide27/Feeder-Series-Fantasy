#!/usr/bin/env node
/**
 * Script pour calculer les scores de toutes les équipes après un weekend
 * Usage: node scripts/calculate-scores.js <weekendId> <season>
 * Exemple: node scripts/calculate-scores.js 1 2026
 */

require('dotenv').config();
const db = require("../db");
const { getQualifyingPoints, getSprintPoints, getFeaturePoints, getConstructorPoints } = require("../logic/scoring");

const weekendId = parseInt(process.argv[2]);
const season = parseInt(process.argv[3]) || 2026;

if (!weekendId || isNaN(weekendId)) {
  console.error("❌ Usage: node scripts/calculate-scores.js <weekendId> <season>");
  console.error("   Exemple: node scripts/calculate-scores.js 1 2026");
  process.exit(1);
}

async function calculateScores() {
  console.log("=".repeat(60));
  console.log(`🏁 Calcul des scores - Weekend ${weekendId} - Saison ${season}`);
  console.log("=".repeat(60));

  try {
    const weekendResult = await db.query(`
      SELECT id, name, round 
      FROM race_weekends 
      WHERE id = $1
    `, [weekendId]);

    const weekend = weekendResult.rows[0];
    if (!weekend) {
      console.error(`❌ Weekend ${weekendId} non trouvé`);
      process.exit(1);
    }

    console.log(`Weekend: ${weekend.name} (Round ${weekend.round})\n`);

    console.log("📊 Calcul des points constructeurs...");
    const constructorPoints = await getConstructorPoints(weekendId);
    const constructorMap = Object.fromEntries(
      constructorPoints.map(c => [c.constructor_id, c.points])
    );
    console.log(`✅ ${constructorPoints.length} écuries calculées\n`);

    const teamsResult = await db.query(`
      SELECT 
        ft.id as team_id,
        ft.user_id,
        ft.league_id,
        ft.name as team_name,
        u.username
      FROM fantasy_teams ft
      JOIN users u ON ft.user_id = u.id
      WHERE ft.season = $1
    `, [season]);

    const teams = teamsResult.rows;
    console.log(`📊 ${teams.length} équipes à traiter\n`);

    let processedCount = 0;

    for (const team of teams) {
      try {
        const driversResult = await db.query(`
          SELECT driver_id, is_captain 
          FROM fantasy_picks 
          WHERE fantasy_team_id = $1
        `, [team.team_id]);

        const constructorsResult = await db.query(`
          SELECT constructor_id 
          FROM fantasy_constructors 
          WHERE fantasy_team_id = $1
        `, [team.team_id]);

        if (driversResult.rows.length === 0 && constructorsResult.rows.length === 0) {
          console.log(`⚠️  ${team.username} (${team.team_name}): Équipe vide - ignoré`);
          continue;
        }

        const qualPoints = await getQualifyingPoints(weekendId, team.team_id);
        const sprintPoints = await getSprintPoints(weekendId, team.team_id);
        const featurePoints = await getFeaturePoints(weekendId, team.team_id);

        const qualMap = Object.fromEntries(qualPoints.map(p => [p.driver_id, p.points]));
        const sprintMap = Object.fromEntries(sprintPoints.map(p => [p.driver_id, p.points]));
        const featureMap = Object.fromEntries(featurePoints.map(p => [p.driver_id, p.points]));

        let driversTotal = 0;
        driversResult.rows.forEach(driver => {
          const driverTotal = (qualMap[driver.driver_id] || 0) +
                             (sprintMap[driver.driver_id] || 0) +
                             (featureMap[driver.driver_id] || 0);
          driversTotal += driverTotal;
        });

        let constructorsTotal = 0;
        constructorsResult.rows.forEach(constructor => {
          constructorsTotal += constructorMap[constructor.constructor_id] || 0;
        });

        const weekendTotal = driversTotal + constructorsTotal;

        await db.query(`
          INSERT INTO league_scores (league_id, user_id, total_points)
          VALUES ($1, $2, $3)
          ON CONFLICT (league_id, user_id) 
          DO UPDATE SET total_points = league_scores.total_points + $3
        `, [team.league_id, team.user_id, weekendTotal]);

        console.log(`✅ ${team.username} (${team.team_name || 'Sans nom'}): +${weekendTotal} points (Pilotes: ${driversTotal} | Écuries: ${constructorsTotal})`);
        processedCount++;

      } catch (err) {
        console.error(`❌ Erreur pour ${team.username}:`, err.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ ${processedCount}/${teams.length} équipes traitées`);
    console.log("=".repeat(60));

    process.exit(0);

  } catch (err) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ ERREUR:", err.message);
    console.error("=".repeat(60));
    console.error(err.stack);
    process.exit(1);
  }
}

calculateScores();