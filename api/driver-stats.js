const express = require("express");
const router = express.Router();
const db = require("../db");
const { pointsQualifying, pointsSprint, pointsFeature } = require("../logic/points");

/**
 * Calcule les statistiques d'un pilote pour le radar de performance
 * GET /api/driver-stats/:driverId
 */
router.get("/:driverId", async (req, res) => {
  const { driverId } = req.params;
  const season = 2026;

  try {
    // 1. Récupérer les infos de base du pilote
    const driverResult = await db.query(`
      SELECT 
        d.id as driver_id,
        d.name as driver_name,
        d.nationality as driver_nationality,
        ds.season,
        ds.rookie,
        ds.price as driver_price,
        c.id as constructor_id,
        c.name as constructor_name
      FROM drivers d
      JOIN driver_seasons ds ON ds.driver_id = d.id AND ds.season = $1
      JOIN constructors c ON ds.constructor_id = c.id
      WHERE d.id = $2
    `, [season, driverId]);

    const driverInfo = driverResult.rows[0];

    if (!driverInfo) {
      return res.status(404).json({ error: "Pilote non trouvé" });
    }

    // 2. Récupérer le dernier numéro de voiture utilisé
    const lastCarNumberResult = await db.query(`
      SELECT car_number
      FROM weekend_participants
      WHERE driver_id = $1
      ORDER BY race_weekend_id DESC
      LIMIT 1
    `, [driverId]);

    const lastCarNumber = lastCarNumberResult.rows[0];
    driverInfo.driver_number = lastCarNumber?.car_number || null;

    // 3. Récupérer les 5 derniers weekends (2026 puis 2025)
    const last5Result = await db.query(`
      SELECT 
        rw.id as weekend_id,
        rw.season,
        rw.round,
        rw.name as weekend_name,
        q.position as quali_position,
        q.status as quali_status,
        s.finish_position as sprint_position,
        s.status as sprint_status,
        s.fastest_lap as sprint_fastest_lap,
        f.finish_position as feature_position,
        f.status as feature_status,
        f.fastest_lap as feature_fastest_lap
      FROM weekend_participants wp
      JOIN race_weekends rw ON rw.id = wp.race_weekend_id
      LEFT JOIN qualifying_results q ON q.driver_id = wp.driver_id AND q.race_weekend_id = rw.id
      LEFT JOIN sprint_results s ON s.driver_id = wp.driver_id AND s.race_weekend_id = rw.id
      LEFT JOIN feature_results f ON f.driver_id = wp.driver_id AND f.race_weekend_id = rw.id
      WHERE wp.driver_id = $1
      ORDER BY rw.season DESC, rw.round DESC
      LIMIT 5
    `, [driverId]);

    const last5Weekends = last5Result.rows;

    // 4. Calculer les points pour les 5 derniers weekends
    const weekendsWithPoints = last5Weekends.map(w => {
      const qualiPoints = pointsQualifying(w.quali_position, w.quali_status);
      const sprintPoints = pointsSprint(w.sprint_position, w.sprint_status, w.sprint_fastest_lap);
      const featurePoints = pointsFeature(w.feature_position, w.feature_status, w.feature_fastest_lap);
      
      return {
        weekend_id: w.weekend_id,
        season: w.season,
        round: w.round,
        weekend_name: w.weekend_name,
        quali_position: w.quali_position,
        sprint_position: w.sprint_position,
        feature_position: w.feature_position,
        quali_points: qualiPoints,
        sprint_points: sprintPoints,
        feature_points: featurePoints,
        total_points: qualiPoints + sprintPoints + featurePoints
      };
    });

    // 5. Remplir avec des slots vides si moins de 5 weekends
    while (weekendsWithPoints.length < 5) {
      weekendsWithPoints.push({
        weekend_id: null,
        season: null,
        round: null,
        weekend_name: "N/A",
        quali_position: null,
        sprint_position: null,
        feature_position: null,
        quali_points: 0,
        sprint_points: 0,
        feature_points: 0,
        total_points: 0
      });
    }

    // 6. Récupérer TOUS les weekends du pilote pour les statistiques globales
    const allWeekendsResult = await db.query(`
      SELECT 
        rw.id as weekend_id,
        q.position as quali_position,
        q.status as quali_status,
        s.finish_position as sprint_position,
        s.status as sprint_status,
        s.fastest_lap as sprint_fastest_lap,
        f.finish_position as feature_position,
        f.status as feature_status,
        f.fastest_lap as feature_fastest_lap
      FROM weekend_participants wp
      JOIN race_weekends rw ON rw.id = wp.race_weekend_id
      LEFT JOIN qualifying_results q ON q.driver_id = wp.driver_id AND q.race_weekend_id = rw.id
      LEFT JOIN sprint_results s ON s.driver_id = wp.driver_id AND s.race_weekend_id = rw.id
      LEFT JOIN feature_results f ON f.driver_id = wp.driver_id AND f.race_weekend_id = rw.id
      WHERE wp.driver_id = $1
    `, [driverId]);

    const allWeekends = allWeekendsResult.rows;

    if (allWeekends.length === 0) {
      return res.json({
        driver: driverInfo,
        hasData: false,
        message: "Pas encore assez de données pour afficher les performances"
      });
    }

    // 7. Calculer les moyennes de positions (en excluant DNS/DNF/DSQ)
    const qualiPositions = allWeekends
      .filter(w => w.quali_position && !['DNS', 'DNF', 'DSQ'].includes(w.quali_status))
      .map(w => w.quali_position);
    
    const sprintPositions = allWeekends
      .filter(w => w.sprint_position && !['DNS', 'DNF', 'DSQ'].includes(w.sprint_status))
      .map(w => w.sprint_position);
    
    const featurePositions = allWeekends
      .filter(w => w.feature_position && !['DNS', 'DNF', 'DSQ'].includes(w.feature_status))
      .map(w => w.feature_position);

    const avgQuali = qualiPositions.length > 0 
      ? qualiPositions.reduce((a, b) => a + b, 0) / qualiPositions.length 
      : null;
    
    const avgSprint = sprintPositions.length > 0 
      ? sprintPositions.reduce((a, b) => a + b, 0) / sprintPositions.length 
      : null;
    
    const avgFeature = featurePositions.length > 0 
      ? featurePositions.reduce((a, b) => a + b, 0) / featurePositions.length 
      : null;

    // 8. Calculer les points totaux
    const totalPoints = allWeekends.reduce((sum, w) => {
      const qPts = pointsQualifying(w.quali_position, w.quali_status);
      const sPts = pointsSprint(w.sprint_position, w.sprint_status, w.sprint_fastest_lap);
      const fPts = pointsFeature(w.feature_position, w.feature_status, w.feature_fastest_lap);
      return sum + qPts + sPts + fPts;
    }, 0);

    // 9. Ratio Points/M
    const pointsPerMillion = totalPoints / driverInfo.driver_price;

    // 10. Meilleur weekend (grouper par weekend_id)
    const weekendTotals = {};
    allWeekends.forEach(w => {
      if (!weekendTotals[w.weekend_id]) weekendTotals[w.weekend_id] = 0;
      const qPts = pointsQualifying(w.quali_position, w.quali_status);
      const sPts = pointsSprint(w.sprint_position, w.sprint_status, w.sprint_fastest_lap);
      const fPts = pointsFeature(w.feature_position, w.feature_status, w.feature_fastest_lap);
      weekendTotals[w.weekend_id] += qPts + sPts + fPts;
    });

    const bestWeekend = Math.max(0, ...Object.values(weekendTotals));

    // 11. Normalisation - récupérer tous les pilotes ayant fait au moins 1 course en 2026
    const allDrivers2026Result = await db.query(`
      SELECT DISTINCT wp.driver_id, ds.price
      FROM weekend_participants wp
      JOIN race_weekends rw ON rw.id = wp.race_weekend_id
      JOIN driver_seasons ds ON ds.driver_id = wp.driver_id AND ds.season = rw.season
      WHERE rw.season = $1
    `, [season]);

    const allDrivers2026 = allDrivers2026Result.rows;

    // 12. Calculer les stats de tous les pilotes 2026 pour la normalisation
    const allDriversStats = await Promise.all(allDrivers2026.map(async (driver) => {
      const driverWeekendsResult = await db.query(`
        SELECT 
          q.position as quali_position,
          q.status as quali_status,
          s.finish_position as sprint_position,
          s.status as sprint_status,
          s.fastest_lap as sprint_fastest_lap,
          f.finish_position as feature_position,
          f.status as feature_status,
          f.fastest_lap as feature_fastest_lap,
          rw.id as weekend_id
        FROM weekend_participants wp
        JOIN race_weekends rw ON rw.id = wp.race_weekend_id
        LEFT JOIN qualifying_results q ON q.driver_id = wp.driver_id AND q.race_weekend_id = rw.id
        LEFT JOIN sprint_results s ON s.driver_id = wp.driver_id AND s.race_weekend_id = rw.id
        LEFT JOIN feature_results f ON f.driver_id = wp.driver_id AND f.race_weekend_id = rw.id
        WHERE wp.driver_id = $1 AND rw.season = $2
      `, [driver.driver_id, season]);

      const driverWeekends = driverWeekendsResult.rows;

      const qPos = driverWeekends
        .filter(w => w.quali_position && !['DNS', 'DNF', 'DSQ'].includes(w.quali_status))
        .map(w => w.quali_position);
      
      const sPos = driverWeekends
        .filter(w => w.sprint_position && !['DNS', 'DNF', 'DSQ'].includes(w.sprint_status))
        .map(w => w.sprint_position);
      
      const fPos = driverWeekends
        .filter(w => w.feature_position && !['DNS', 'DNF', 'DSQ'].includes(w.feature_status))
        .map(w => w.feature_position);

      const avgQ = qPos.length > 0 ? qPos.reduce((a, b) => a + b, 0) / qPos.length : null;
      const avgS = sPos.length > 0 ? sPos.reduce((a, b) => a + b, 0) / sPos.length : null;
      const avgF = fPos.length > 0 ? fPos.reduce((a, b) => a + b, 0) / fPos.length : null;

      const pts = driverWeekends.reduce((sum, w) => {
        return sum + 
          pointsQualifying(w.quali_position, w.quali_status) +
          pointsSprint(w.sprint_position, w.sprint_status, w.sprint_fastest_lap) +
          pointsFeature(w.feature_position, w.feature_status, w.feature_fastest_lap);
      }, 0);

      const weekendTotals = {};
      driverWeekends.forEach(w => {
        if (!weekendTotals[w.weekend_id]) weekendTotals[w.weekend_id] = 0;
        weekendTotals[w.weekend_id] += 
          pointsQualifying(w.quali_position, w.quali_status) +
          pointsSprint(w.sprint_position, w.sprint_status, w.sprint_fastest_lap) +
          pointsFeature(w.feature_position, w.feature_status, w.feature_fastest_lap);
      });

      const bestWE = Math.max(0, ...Object.values(weekendTotals));

      return {
        driver_id: driver.driver_id,
        price: driver.price,
        avg_quali: avgQ,
        avg_sprint: avgS,
        avg_feature: avgF,
        total_points: pts,
        points_per_million: pts / driver.price,
        best_weekend: bestWE
      };
    }));

    // 13. Valeurs max pour la normalisation
    const pointsPerMillionValues = allDriversStats
      .map(d => d.points_per_million)
      .filter(v => !isNaN(v) && isFinite(v));
    
    const bestWeekendValues = allDriversStats
      .map(d => d.best_weekend)
      .filter(v => !isNaN(v) && isFinite(v));

    const maxPointsPerMillion = Math.max(...pointsPerMillionValues, 1);
    const maxBestWeekend = Math.max(...bestWeekendValues, 1);

    // 14. Normalisation (0-1) avec inversion pour les positions
    const normalizePosition = (avgPos) => {
      if (!avgPos || isNaN(avgPos)) return 0;
      return Math.max(0, Math.min(1, (22 - avgPos) / 21));
    };

    const normalizedStats = {
      avg_quali: normalizePosition(avgQuali),
      avg_sprint: normalizePosition(avgSprint),
      avg_feature: normalizePosition(avgFeature),
      points_per_million: Math.min(1, pointsPerMillion / maxPointsPerMillion),
      best_weekend: Math.min(1, bestWeekend / maxBestWeekend)
    };

    // 15. Valeurs brutes pour affichage
    const uniqueWeekends = new Set(allWeekends.map(w => w.weekend_id));
    const rawStats = {
      avg_quali: avgQuali ? parseFloat(avgQuali.toFixed(1)) : null,
      avg_sprint: avgSprint ? parseFloat(avgSprint.toFixed(1)) : null,
      avg_feature: avgFeature ? parseFloat(avgFeature.toFixed(1)) : null,
      points_per_million: parseFloat(pointsPerMillion.toFixed(1)),
      best_weekend: bestWeekend,
      total_points: totalPoints,
      races_count: uniqueWeekends.size
    };

    res.json({
      driver: driverInfo,
      hasData: true,
      normalized: normalizedStats,
      raw: rawStats,
      last_weekends: weekendsWithPoints
    });

  } catch (error) {
    console.error("Error fetching driver stats:", error);
    res.status(500).json({ error: "Erreur lors du calcul des statistiques" });
  }
});

module.exports = router;