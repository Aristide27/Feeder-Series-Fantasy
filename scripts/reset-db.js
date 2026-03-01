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
    
    // Désactiver les contraintes temporairement
    await client.query('SET session_replication_role = replica;');
    
    // Supprimer toutes les tables
    await client.query(`
      DROP TABLE IF EXISTS 
        price_history,
        feature_results,
        sprint_results,
        qualifying_results,
        weekend_participants,
        fantasy_picks,
        fantasy_constructors,
        fantasy_teams,
        league_scores,
        league_members,
        leagues,
        driver_seasons,
        race_weekends,
        constructors,
        drivers,
        users
      CASCADE;
    `);
    
    // Réactiver les contraintes
    await client.query('SET session_replication_role = DEFAULT;');
    
    console.log("✅ Toutes les tables supprimées\n");
    
  } catch (err) {
    console.error("❌ Erreur:", err);
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
  console.error("Erreur fatale:", err);
  process.exit(1);
});