#!/usr/bin/env node

/**
 * Script manuel pour mettre à jour les prix et budgets après un weekend
 * Usage: node scripts/update-prices.js <weekendId> <season>
 * Exemple: node scripts/update-prices.js 1 2026
 */

const { updateAllDriverPrices, updateConstructorPrices } = require("../logic/pricing");
const { updateAllTeamBudgets } = require("../logic/budget-manager");
const db = require("../db");

// Récupérer les arguments
const weekendId = parseInt(process.argv[2]);
const season = parseInt(process.argv[3]) || 2026;

if (!weekendId || isNaN(weekendId)) {
  console.error("❌ Usage: node scripts/update-prices.js <weekendId> <season>");
  console.error("   Exemple: node scripts/update-prices.js 1 2026");
  process.exit(1);
}

console.log("=".repeat(60));
console.log(`🏁 Mise à jour des prix - Weekend ${weekendId} - Saison ${season}`);
console.log("=".repeat(60));

try {
  // Vérifier que le weekend existe
  const weekend = db.prepare(`
    SELECT id, name, round, prices_updated 
    FROM race_weekends 
    WHERE id = ?
  `).get(weekendId);

  if (!weekend) {
    console.error(`❌ Weekend ${weekendId} non trouvé`);
    process.exit(1);
  }

  console.log(`Weekend: ${weekend.name} (Round ${weekend.round})`);

  if (weekend.prices_updated === 1) {
    console.warn(`⚠️  Les prix ont déjà été mis à jour pour ce weekend`);
    console.log(`    Pour forcer la mise à jour, exécute d'abord :`);
    console.log(`    UPDATE race_weekends SET prices_updated = 0 WHERE id = ${weekendId};`);
    process.exit(0);
  }

  console.log("");

  // 1. Mettre à jour les prix des pilotes
  console.log("1/3 - Mise à jour des prix pilotes (Système Seuil de Rentabilité)...");
  const driverUpdates = updateAllDriverPrices(season, weekendId);
  console.log(`✅ ${driverUpdates.length} pilotes mis à jour`);
  
  // Afficher les 5 plus grandes variations
  const topChanges = driverUpdates
    .sort((a, b) => Math.abs(b.variation) - Math.abs(a.variation))
    .slice(0, 5);
  
  console.log("\n   Top 5 variations:");
  topChanges.forEach(d => {
    const sign = d.variation >= 0 ? '+' : '';
    console.log(`   • Driver ${d.driver_id}: ${d.prixActuel.toFixed(1)}M → ${d.nouveauPrix.toFixed(1)}M (${sign}${d.variation.toFixed(2)}M)`);
    console.log(`     S_perf: ${d.sPerf.toFixed(2)} | Attente: ${d.attente.toFixed(2)} | Δ_brute: ${d.deltaBrute.toFixed(3)}`);
  });

  console.log("");

  // 2. Mettre à jour les prix des constructeurs
  console.log("2/3 - Mise à jour des prix constructeurs...");
  const constructorUpdates = updateConstructorPrices(season);
  console.log(`✅ ${constructorUpdates.length} constructeurs mis à jour`);

  console.log("");

  // 3. Mettre à jour les budgets des équipes
  console.log("3/3 - Mise à jour des budgets équipes...");
  const budgetUpdates = updateAllTeamBudgets(season);
  console.log(`✅ ${budgetUpdates.length} équipes mises à jour`);

  // Statistiques
  const increases = budgetUpdates.filter(b => b.difference > 0).length;
  const decreases = budgetUpdates.filter(b => b.difference < 0).length;
  const unchanged = budgetUpdates.filter(b => b.difference === 0).length;

  console.log("");

  // 4. Marquer le weekend comme traité
  db.prepare(`
    UPDATE race_weekends 
    SET prices_updated = 1 
    WHERE id = ?
  `).run(weekendId);

  console.log("=".repeat(60));
  console.log("Mise à jour terminée avec succès !");
  console.log("=".repeat(60));

} catch (err) {
  console.error("");
  console.error("=".repeat(60));
  console.error("❌ ERREUR:", err.message);
  console.error("=".repeat(60));
  console.error(err.stack);
  process.exit(1);
}