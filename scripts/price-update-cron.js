#!/usr/bin/env node

/**
 * Cron job qui vérifie toutes les 5 minutes si des weekends sont déverrouillés
 * et met à jour automatiquement les prix et budgets
 * 
 * À lancer avec: node scripts/price-update-cron.js
 * Ou avec PM2: pm2 start scripts/price-update-cron.js --name "price-updater"
 */

const { updateAllDriverPrices, updateConstructorPrices } = require("../logic/pricing");
const { updateAllTeamBudgets } = require("../logic/budget-manager");
const db = require("../db");

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SEASON = 2026;

function checkAndUpdate() {
  const now = new Date().toISOString();
  
  console.log(`[${now}] 🔍 Vérification des weekends à traiter...`);

  try {
    // Trouver les weekends qui sont passés et pas encore traités
    const weekendsToUpdate = db.prepare(`
      SELECT id, name, unlock_at 
      FROM race_weekends 
      WHERE season = ? 
        AND unlock_at IS NOT NULL
        AND unlock_at <= ? 
        AND prices_updated = 0
      ORDER BY round ASC
    `).all(SEASON, now);

    if (weekendsToUpdate.length === 0) {
      console.log(`   ✅ Aucun weekend à traiter`);
      return;
    }

    console.log(`   📋 ${weekendsToUpdate.length} weekend(s) à traiter`);

    for (const weekend of weekendsToUpdate) {
      console.log("");
      console.log("=".repeat(60));
      console.log(`🏁 Traitement: ${weekend.name} (ID: ${weekend.id})`);
      console.log("=".repeat(60));

      try {
        // 1. Prix pilotes
        console.log("📊 Mise à jour des prix pilotes...");
        const driverUpdates = updateAllDriverPrices(SEASON, weekend.id);
        console.log(`✅ ${driverUpdates.length} pilotes mis à jour`);

        // 2. Prix constructeurs
        console.log("🏎️  Mise à jour des prix constructeurs...");
        const constructorUpdates = updateConstructorPrices(SEASON);
        console.log(`✅ ${constructorUpdates.length} constructeurs mis à jour`);

        // 3. Budgets équipes
        console.log("💰 Mise à jour des budgets équipes...");
        const budgetUpdates = updateAllTeamBudgets(SEASON);
        console.log(`✅ ${budgetUpdates.length} équipes mises à jour`);

        // Statistiques
        const increases = budgetUpdates.filter(b => b.difference > 0).length;
        const decreases = budgetUpdates.filter(b => b.difference < 0).length;

        console.log(`   📈 ${increases} équipes en hausse | 📉 ${decreases} équipes en baisse`);

        // 4. Marquer comme traité
        db.prepare(`
          UPDATE race_weekends 
          SET prices_updated = 1 
          WHERE id = ?
        `).run(weekend.id);

        console.log(`✅ ${weekend.name} traité avec succès`);

      } catch (err) {
        console.error(`❌ Erreur sur ${weekend.name}:`, err.message);
        console.error(err.stack);
        // Continue avec le prochain weekend malgré l'erreur
      }
    }

    console.log("");
    console.log("=".repeat(60));
    console.log("✅ Traitement terminé");
    console.log("=".repeat(60));

  } catch (err) {
    console.error("❌ Erreur globale:", err.message);
    console.error(err.stack);
  }
}

// Lancer une première fois au démarrage
console.log("🚀 Démarrage du cron de mise à jour des prix");
console.log(`   Intervalle: ${CHECK_INTERVAL / 60000} minutes`);
console.log(`   Saison: ${SEASON}`);
console.log("");

checkAndUpdate();

// Puis répéter toutes les 5 minutes
setInterval(checkAndUpdate, CHECK_INTERVAL);

// Garder le process actif
process.on('SIGINT', () => {
  console.log("\n👋 Arrêt du cron");
  process.exit(0);
});