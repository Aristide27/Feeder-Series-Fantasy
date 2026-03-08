const db = require('../db');

async function resetWeekend1() {
  const weekendId = 15;
  const season = 2026;

  try {
    console.log("🔧 Reset weekend 1 (Australie)...\n");

    // ═══════════════════════════════════════════════════════
    // 1️⃣ REMETTRE LES PRIX INITIAUX PILOTES
    // ═══════════════════════════════════════════════════════
    console.log("💰 Reset prix pilotes...");
    
    const initialDriverPrices = {
      1: 24.0, 2: 20.0, 3: 14.0, 4: 15.0, 5: 15.0, 6: 20.0,
      7: 20.0, 8: 14.0, 9: 15.0, 10: 15.0, 11: 15.0, 12: 16.0,
      13: 18.0, 14: 22.0, 15: 9.0, 16: 12.0, 17: 7.0, 18: 5.0,
      19: 7.0, 20: 10.0, 21: 10.0, 22: 7.0
    };

    for (const [driverId, price] of Object.entries(initialDriverPrices)) {
      await db.query(
        `UPDATE driver_seasons SET price = $1, last_delta = 0 WHERE driver_id = $2 AND season = $3`,
        [price, driverId, season]
      );
    }

    // ═══════════════════════════════════════════════════════
    // 2️⃣ REMETTRE LES PRIX INITIAUX ÉCURIES
    // ═══════════════════════════════════════════════════════
    console.log("🏎️  Reset prix écuries...");
    
    const initialConstructorPrices = {
      1: 22.0,    // Invicta Racing
      2: 14.5,    // Hitech TGR
      3: 17.5,    // Campos Racing
      4: 17.0,    // DAMS Lucas Oil
      5: 15.0,    // MP Motorsport
      6: 15.5,    // PREMA Racing
      7: 20.0,    // Rodin Motorsport
      8: 10.5,    // ART Grand Prix
      9: 6.0,     // AIX Racing
      10: 8.5,    // Van Amersfoort Racing
      11: 8.5     // Trident
    };

    for (const [constructorId, price] of Object.entries(initialConstructorPrices)) {
      await db.query(
        `UPDATE constructors SET price = $1 WHERE id = $2`,
        [price, constructorId]
      );
    }

    // ═══════════════════════════════════════════════════════
    // 3️⃣ SUPPRIMER L'HISTORIQUE DE PRIX (fausses valeurs)
    // ═══════════════════════════════════════════════════════
    console.log("🗑️  Suppression price_history...");
    await db.query('DELETE FROM price_history WHERE race_weekend_id = $1', [weekendId]);

    // ═══════════════════════════════════════════════════════
    // 4️⃣ SUPPRIMER LES SCORES
    // ═══════════════════════════════════════════════════════
    console.log("🗑️  Suppression scores...");
    await db.query('DELETE FROM fantasy_scores WHERE race_weekend_id = $1', [weekendId]);
    await db.query('UPDATE league_scores SET total_points = 0');

    // ═══════════════════════════════════════════════════════
    // 5️⃣ INSÉRER RÉSULTATS SPRINT
    // ═══════════════════════════════════════════════════════
    console.log("📊 Insertion sprint...");
    await db.query('DELETE FROM sprint_results WHERE race_weekend_id = $1', [weekendId]);
    
    const sprintResults = [
      { driver_id: 2,  position: 1,  status: 'OK',  fastest_lap: false },
      { driver_id: 5,  position: 2,  status: 'OK',  fastest_lap: false },
      { driver_id: 14, position: 3,  status: 'OK',  fastest_lap: false },
      { driver_id: 16, position: 4,  status: 'OK',  fastest_lap: false },
      { driver_id: 3,  position: 5,  status: 'OK',  fastest_lap: false },
      { driver_id: 9,  position: 6,  status: 'OK',  fastest_lap: false },
      { driver_id: 21, position: 7,  status: 'OK',  fastest_lap: false },
      { driver_id: 8,  position: 8,  status: 'OK',  fastest_lap: false },
      { driver_id: 11, position: 9,  status: 'OK',  fastest_lap: false },
      { driver_id: 13, position: 10, status: 'OK',  fastest_lap: true  },
      { driver_id: 1,  position: 11, status: 'OK',  fastest_lap: false },
      { driver_id: 15, position: 12, status: 'OK',  fastest_lap: false },
      { driver_id: 20, position: 13, status: 'OK',  fastest_lap: false },
      { driver_id: 17, position: 14, status: 'OK',  fastest_lap: false },
      { driver_id: 22, position: 15, status: 'OK',  fastest_lap: false },
      { driver_id: 4,  position: 16, status: 'OK',  fastest_lap: false },
      { driver_id: 6,  position: 17, status: 'OK',  fastest_lap: false },
      { driver_id: 10, position: 18, status: 'OK',  fastest_lap: false },
      { driver_id: 18, position: 19, status: 'OK',  fastest_lap: false },
      { driver_id: 7,  position: 20, status: 'OK',  fastest_lap: false },
      { driver_id: 19, position: 21, status: 'OK',  fastest_lap: false },
      { driver_id: 12, position: 22, status: 'DNF', fastest_lap: false }
    ];

    for (const r of sprintResults) {
      await db.query(
        `INSERT INTO sprint_results (driver_id, race_weekend_id, finish_position, status, fastest_lap)
         VALUES ($1, $2, $3, $4, $5)`,
        [r.driver_id, weekendId, r.position, r.status, r.fastest_lap ? 1 : 0]
      );
    }

    // ═══════════════════════════════════════════════════════
    // 6️⃣ INSÉRER RÉSULTATS FEATURE
    // ═══════════════════════════════════════════════════════
    console.log("🏁 Insertion feature...");
    await db.query('DELETE FROM feature_results WHERE race_weekend_id = $1', [weekendId]);
    
    const featureResults = [
      { driver_id: 6,  position: 1,  status: 'OK',  fastest_lap: false },
      { driver_id: 1,  position: 2,  status: 'OK',  fastest_lap: false },
      { driver_id: 21, position: 3,  status: 'OK',  fastest_lap: true  },
      { driver_id: 10, position: 4,  status: 'OK',  fastest_lap: false },
      { driver_id: 3,  position: 5,  status: 'OK',  fastest_lap: false },
      { driver_id: 16, position: 6,  status: 'OK',  fastest_lap: false },
      { driver_id: 4,  position: 7,  status: 'OK',  fastest_lap: false },
      { driver_id: 9,  position: 8,  status: 'OK',  fastest_lap: false },
      { driver_id: 11, position: 9,  status: 'OK',  fastest_lap: false },
      { driver_id: 2,  position: 10, status: 'OK',  fastest_lap: false },
      { driver_id: 20, position: 11, status: 'OK',  fastest_lap: false },
      { driver_id: 8,  position: 12, status: 'OK',  fastest_lap: false },
      { driver_id: 12, position: 13, status: 'OK',  fastest_lap: false },
      { driver_id: 5,  position: 14, status: 'OK',  fastest_lap: false },
      { driver_id: 17, position: 15, status: 'OK',  fastest_lap: false },
      { driver_id: 15, position: 16, status: 'OK',  fastest_lap: false },
      { driver_id: 19, position: 17, status: 'OK',  fastest_lap: false },
      { driver_id: 22, position: 18, status: 'OK',  fastest_lap: false },
      { driver_id: 18, position: 19, status: 'OK',  fastest_lap: false },
      { driver_id: 7,  position: 20, status: 'DNF', fastest_lap: false },
      { driver_id: 13, position: 21, status: 'DNF', fastest_lap: false },
      { driver_id: 14, position: 22, status: 'DNF', fastest_lap: false }
    ];

    for (const r of featureResults) {
      await db.query(
        `INSERT INTO feature_results (driver_id, race_weekend_id, finish_position, status, fastest_lap)
         VALUES ($1, $2, $3, $4, $5)`,
        [r.driver_id, weekendId, r.position, r.status, r.fastest_lap ? 1 : 0]
      );
    }

    // ═══════════════════════════════════════════════════════
    // 7️⃣ DÉBLOQUER LE WEEKEND
    // ═══════════════════════════════════════════════════════
    console.log("🔓 Déblocage weekend...");
    await db.query(`UPDATE race_weekends SET prices_updated = 0 WHERE id = $1`, [weekendId]);

    console.log("\n✅ Reset terminé !");
    console.log("\n🚀 Lance maintenant : node scripts/auto-weekend-processor.js");
    console.log("   Ou attends que le cron PM2 l'exécute (dans les 5 min)\n");

  } catch (err) {
    console.error("\n❌ Erreur:", err);
    throw err;
  } finally {
    process.exit(0);
  }
}

resetWeekend1();