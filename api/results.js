const express = require("express");
const router = express.Router();
const db = require("../db");

// Résultats d'un weekend pour un pilote
router.get("/weekend/:weekendId", (req, res) => {
  const results = db.prepare(`
    SELECT d.name AS driver, q.position AS qualy, s.finish_position AS sprint, f.finish_position AS feature
    FROM race_entries re
    JOIN drivers d ON d.id = re.driver_season_id
    LEFT JOIN qualifying_results q ON q.race_entry_id = re.id
    LEFT JOIN sprint_results s ON s.race_entry_id = re.id
    LEFT JOIN feature_results f ON f.race_entry_id = re.id
    WHERE re.race_weekend_id = ?
  `).all(req.params.weekendId);

  res.json(results);
});

module.exports = router;
