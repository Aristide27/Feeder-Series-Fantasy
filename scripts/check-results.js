const db = require("../db"); // Ton instance Better-SQLite3

function debugWeekend(weekendId, season) {
  console.log(`\n=== DEBUG ROUND ${weekendId} (${season}) ===\n`);

  // 1. DATA PILOTES
  const driverDebug = db.prepare(`
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
          -- Calcul rapide des points réels pour vérification visuelle
          SELECT 2 as points FROM qualifying_results WHERE driver_id = d.id AND race_weekend_id = ? AND position = 1
          UNION ALL
          SELECT CASE 
            WHEN finish_position <= 8 THEN (11 - finish_position) -- Simplifié Sprint
            ELSE 0 END + fastest_lap as points FROM sprint_results WHERE driver_id = d.id AND race_weekend_id = ?
          UNION ALL
          SELECT CASE 
            WHEN finish_position = 1 THEN 25 
            WHEN finish_position = 2 THEN 18 -- etc...
            ELSE 0 END + fastest_lap as points FROM feature_results WHERE driver_id = d.id AND race_weekend_id = ?
      )) as pts_estimes
    FROM drivers d
    JOIN driver_seasons ds ON d.id = ds.driver_id AND ds.season = ?
    JOIN constructors c ON ds.constructor_id = c.id
    LEFT JOIN price_history ph ON d.id = ph.driver_id AND ph.race_weekend_id = ?
    ORDER BY ph.s_perf DESC
  `).all(weekendId, weekendId, weekendId, season, weekendId);

  console.log("--- PERFORMANCE PILOTES ---");
  console.table(driverDebug.map(d => ({
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
  const constructorDebug = db.prepare(`
    SELECT 
      name,
      price
    FROM constructors
    ORDER BY price DESC
  `).all();

  console.log("\n--- PRIX ÉCURIES (Moyenne Pilotes) ---");
  console.table(constructorDebug.map(c => ({
    Ecurie: c.name,
    "Prix Actuel": c.price.toFixed(2) + "M"
  })));
}

// Remplace par l'ID de ton weekend de test
debugWeekend(15, 2026);