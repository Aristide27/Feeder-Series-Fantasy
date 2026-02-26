#!/usr/bin/env node
require('dotenv').config();
const db = require("../db");

async function debugWeekend(weekendId, season) {
  console.log(`\n=== DEBUG ROUND ${weekendId} (${season}) ===\n`);

  try {
    // 1. DATA PILOTES
    const driverDebug = await db.query(`
      SELECT 
        d.name,
        c.slug as team,
        ds.price as current_price,
        ph.price_before,
        ph.price_after,
        ph.s_perf,
        ph.attente,
        ph.delta_brute,
        (SELECT SUM(points) FROM (
            SELECT 2 as points FROM qualifying_results WHERE driver_id = d.id AND race_weekend_id = $1 AND position = 1
            UNION ALL
            SELECT CASE 
              WHEN finish_position <= 8 THEN (11 - finish_position)
              ELSE 0 END + COALESCE(fastest_lap, 0) as points FROM sprint_results WHERE driver_id = d.id AND race_weekend_id = $1
            UNION ALL
            SELECT CASE 
              WHEN finish_position = 1 THEN 25 
              WHEN finish_position = 2 THEN 18
              ELSE 0 END + COALESCE(fastest_lap, 0) as points FROM feature_results WHERE driver_id = d.id AND race_weekend_id = $1
        ) AS subquery) as pts_estimes
      FROM drivers d
      JOIN driver_seasons ds ON d.id = ds.driver_id AND ds.season = $2
      JOIN constructors c ON ds.constructor_id = c.id
      LEFT JOIN price_history ph ON d.id = ph.driver_id AND ph.race_weekend_id = $1
      ORDER BY ph.s_perf DESC NULLS LAST
    `, [weekendId, season]);

    console.log("--- PERFORMANCE PILOTES ---");
    console.table(driverDebug.rows.map(d => ({
      Nom: d.name,
      Team: d.team,
      "S_Perf": d.s_perf?.toFixed(2),
      "Attente (E)": d.attente?.toFixed(2),
      "Delta": d.delta_brute?.toFixed(3),
      "Ancien Prix": d.price_before?.toFixed(2) + "M",
      "Nouveau Prix": d.price_after?.toFixed(2) + "M",
      "Var Absolue": (d.price_after - d.price_before)?.toFixed(2)
    })));

    // 2. DATA ÉCURIES
    const constructorDebug = await db.query(`
      SELECT 
        name,
        price
      FROM constructors
      ORDER BY price DESC
    `);

    console.log("\n--- PRIX ÉCURIES (Moyenne Pilotes) ---");
    console.table(constructorDebug.rows.map(c => ({
      Ecurie: c.name,
      "Prix Actuel": c.price.toFixed(2) + "M"
    })));

    process.exit(0);
  } catch (err) {
    console.error("❌ ERREUR:", err);
    process.exit(1);
  }
}

const weekendId = parseInt(process.argv[2]) || 15;
const season = parseInt(process.argv[3]) || 2026;

debugWeekend(weekendId, season);