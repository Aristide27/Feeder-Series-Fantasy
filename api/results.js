const express = require("express");
const router = express.Router();
const db = require("../db");
// Résultats d'un weekend pour tous les pilotes
router.get("/weekend/:weekendId", async (req, res) => {
  const { weekendId } = req.params;
  
  try {
    // Récupérer tous les pilotes qui ont participé à ce weekend
    const resultsResult = await db.query(`
      SELECT 
        d.id as driver_id,
        d.name AS driver,
        wp.car_number,
        c.name as constructor_name,
        q.position AS qualy,
        q.status AS qualy_status,
        s.finish_position AS sprint,
        s.status AS sprint_status,
        f.finish_position AS feature,
        f.status AS feature_status
      FROM weekend_participants wp
      JOIN drivers d ON d.id = wp.driver_id
      LEFT JOIN constructors c ON c.id = wp.constructor_id
      LEFT JOIN qualifying_results q ON q.driver_id = d.id AND q.race_weekend_id = $1
      LEFT JOIN sprint_results s ON s.driver_id = d.id AND s.race_weekend_id = $2
      LEFT JOIN feature_results f ON f.driver_id = d.id AND f.race_weekend_id = $3
      WHERE wp.race_weekend_id = $4
      ORDER BY COALESCE(f.finish_position, 99), COALESCE(s.finish_position, 99)
    `, [weekendId, weekendId, weekendId, weekendId]);
    res.json(resultsResult.rows);
  } catch (err) {
    console.error("[GET /results/weekend/:weekendId ERROR]", err);
    res.status(500).json({ error: "Erreur lors de la récupération des résultats" });
  }
});
module.exports = router;