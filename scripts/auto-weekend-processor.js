#!/usr/bin/env node
/**
 * Cron job complet qui traite automatiquement les weekends :
 * 1. Calcule les scores de toutes les équipes
 * 2. Met à jour les prix des pilotes et écuries
 * 3. Met à jour les budgets des équipes
 * 
 * À lancer avec PM2: pm2 start scripts/auto-weekend-processor.js --name "weekend-processor"
 */

require('dotenv').config();
const db = require("../db");
const { getQualifyingPoints, getSprintPoints, getFeaturePoints, getConstructorPoints } = require("../logic/scoring");
const { updateAllDriverPrices, updateConstructorPrices } = require("../logic/pricing");
const { updateAllTeamBudgets } = require("../logic/budget-manager");

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SEASON = 2026;

async function processWeekend() {
  const now = new Date().toISOString();
  
  console.log(`[${now}] 🔍 Vérification des weekends à traiter...`);
  
  try {
    const weekendsResult = await db.query(`
      SELECT id, name, unlock_at 
      FROM race_weekends 
      WHERE season = $1 
        AND unlock_at IS NOT NULL
        AND unlock_at <= $2 
        AND prices_updated = 0
      ORDER BY round ASC
    `, [SEASON, now]);

    const weekendsToProcess = weekendsResult.rows;

    if (weekendsToProcess.length === 0) {
      console.log(`   ✅ Aucun weekend à traiter`);
      return;
    }

    console.log(`   📋 ${weekendsToProcess.length} weekend(s) à traiter`);

    for (const weekend of weekendsToProcess) {
      console.log("");
      console.log("=".repeat(60));
      console.log(`🏁 Traitement: ${weekend.name} (ID: ${weekend.id})`);
      console.log("=".repeat(60));

      try {
        // ÉTAPE 1 : CALCUL DES SCORES
        console.log("\n📊 ÉTAPE 1/4 - Calcul des scores...");
        
        const constructorPoints = await getConstructorPoints(weekend.id);
        const constructorMap = Object.fromEntries(
          constructorPoints.map(c => [c.constructor_id, c.points])
        );

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
        `, [SEASON]);

        const teams = teamsResult.rows;
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
              continue;
            }

            const qualPoints = await getQualifyingPoints(weekend.id, team.team_id);
            const sprintPoints = await getSprintPoints(weekend.id, team.team_id);
            const featurePoints = await getFeaturePoints(weekend.id, team.team_id);

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

            processedCount++;

          } catch (err) {
            console.error(`   ❌ Erreur pour ${team.username}:`, err.message);
          }
        }

        console.log(`   ✅ ${processedCount}/${teams.length} équipes calculées`);

        // ÉTAPE 2 : PRIX PILOTES
        console.log("\n📊 ÉTAPE 2/4 - Mise à jour des prix pilotes...");
        const driverUpdates = await updateAllDriverPrices(SEASON, weekend.id);
        console.log(`   ✅ ${driverUpdates.length} pilotes mis à jour`);

        // ÉTAPE 3 : PRIX CONSTRUCTEURS
        console.log("\n🏎️  ÉTAPE 3/4 - Mise à jour des prix constructeurs...");
        const constructorUpdates = await updateConstructorPrices(SEASON);
        console.log(`   ✅ ${constructorUpdates.length} constructeurs mis à jour`);

        // ÉTAPE 4 : BUDGETS ÉQUIPES
        console.log("\n💰 ÉTAPE 4/4 - Mise à jour des budgets équipes...");
        const budgetUpdates = await updateAllTeamBudgets(SEASON);
        console.log(`   ✅ ${budgetUpdates.length} équipes mises à jour`);

        const increases = budgetUpdates.filter(b => b.difference > 0).length;
        const decreases = budgetUpdates.filter(b => b.difference < 0).length;
        console.log(`   📈 ${increases} équipes en hausse | 📉 ${decreases} équipes en baisse`);

        // MARQUER COMME TRAITÉ
        await db.query(`
          UPDATE race_weekends 
          SET prices_updated = 1 
          WHERE id = $1
        `, [weekend.id]);

        console.log(`\n✅ ${weekend.name} traité avec succès`);

      } catch (err) {
        console.error(`\n❌ Erreur sur ${weekend.name}:`, err.message);
        console.error(err.stack);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Traitement terminé");
    console.log("=".repeat(60));

  } catch (err) {
    console.error("❌ Erreur globale:", err.message);
    console.error(err.stack);
  }
}

console.log("🚀 Démarrage du processeur automatique de weekends");
console.log(`   Intervalle: ${CHECK_INTERVAL / 60000} minutes`);
console.log(`   Saison: ${SEASON}`);
console.log(`   Fonctions: Scores → Prix Pilotes → Prix Écuries → Budgets`);
console.log("");

processWeekend();

setInterval(processWeekend, CHECK_INTERVAL);

process.on('SIGINT', () => {
  console.log("\n👋 Arrêt du processeur");
  process.exit(0);
});