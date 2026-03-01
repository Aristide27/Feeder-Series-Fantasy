#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log("🗑️  Suppression de toutes les données...\n");
    
    // Supprimer les tables dans le bon ordre (dépendances)
    const tables = [
      'price_history',
      'feature_results',
      'sprint_results',
      'qualifying_results',
      'weekend_participants',
      'fantasy_picks',
      'fantasy_constructors',
      'fantasy_teams',
      'league_scores',
      'league_members',
      'leagues',
      'driver_seasons',
      'race_weekends',
      'constructors',
      'drivers',
      'users'
    ];
    
    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      console.log(`  ✓ ${table} supprimée`);
    }
    
    console.log("\n✅ Toutes les tables supprimées\n");
    
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
  
  // Maintenant lancer init et seed
  console.log("🔄 Réinitialisation du schéma...\n");
  await require('../db/init')();
  
  console.log("\n🌱 Insertion des données...\n");
  await require('../db/seed')();
  
  console.log("\n✅ Reset complet terminé !");
}

resetDatabase().catch(err => {
  console.error("Erreur fatale:", err.message);
  process.exit(1);
});