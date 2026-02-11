const db = require('../db');
const { pointsQualifying, pointsSprint, pointsFeature } = require('./points');

// --------------------
// Points pilotes
// --------------------
function getQualifyingPoints(weekendId) {
  const results = db.prepare(`
    SELECT qr.driver_id, qr.position, qr.status
    FROM qualifying_results qr
    WHERE qr.race_weekend_id = ?
  `).all(weekendId);

  return results.map(r => ({
    driver_id: r.driver_id,
    points: pointsQualifying(r.position, r.status)
  }));
}

function getSprintPoints(weekendId) {
  const results = db.prepare(`
    SELECT sr.driver_id, sr.finish_position AS position, sr.status, sr.fastest_lap
    FROM sprint_results sr
    WHERE sr.race_weekend_id = ?
  `).all(weekendId);

  return results.map(r => ({
    driver_id: r.driver_id,
    points: pointsSprint(r.position, r.status, r.fastest_lap)
  }));
}

function getFeaturePoints(weekendId) {
  const results = db.prepare(`
    SELECT fr.driver_id, fr.finish_position AS position, fr.status, fr.fastest_lap
    FROM feature_results fr
    WHERE fr.race_weekend_id = ?
  `).all(weekendId);

  return results.map(r => ({
    driver_id: r.driver_id,
    points: pointsFeature(r.position, r.status, r.fastest_lap)
  }));
}

// --------------------
// Points constructeurs
// --------------------
function getConstructorPoints(weekendId) {
  const season = 2026; // Ajouter cette ligne

  const drivers = db.prepare(`
    SELECT wp.driver_id, ds.constructor_id
    FROM weekend_participants wp
    JOIN driver_seasons ds ON ds.driver_id = wp.driver_id AND ds.season = ?
    WHERE wp.race_weekend_id = ?
  `).all(season, weekendId);

  // Récupérer points pilotes
  const qualPoints = Object.fromEntries(getQualifyingPoints(weekendId).map(p => [p.driver_id, p.points]));
  const sprintPoints = Object.fromEntries(getSprintPoints(weekendId).map(p => [p.driver_id, p.points]));
  const featurePoints = Object.fromEntries(getFeaturePoints(weekendId).map(p => [p.driver_id, p.points]));

  // Total points pilotes
  const driverTotals = drivers.map(d => ({
    driver_id: d.driver_id,
    constructor_id: d.constructor_id,
    points: (qualPoints[d.driver_id] || 0) +
            (sprintPoints[d.driver_id] || 0) +
            (featurePoints[d.driver_id] || 0),
    qualPosition: db.prepare(`
      SELECT qr.position
      FROM qualifying_results qr
      WHERE qr.driver_id = ? AND qr.race_weekend_id = ?
    `).get(d.driver_id, weekendId)?.position ?? 20
  }));

  // Grouper par constructeur
  const constructors = {};
  driverTotals.forEach(d => {
    if (!constructors[d.constructor_id]) constructors[d.constructor_id] = [];
    constructors[d.constructor_id].push(d);
  });

  // Calcul points constructeur avec bonus/malus
  const constructorPoints = Object.entries(constructors).map(([constructor_id, drs]) => {
    const [driver1, driver2] = drs;

    const total = (driver1?.points || 0) + (driver2?.points || 0);

    // Qualification bonus/malus
    const positions = [driver1?.qualPosition || 20, driver2?.qualPosition || 20];
    let bonus = 0;

    // Bonus/malus P16
    const p16count = positions.filter(p => p <= 16).length;
    if (p16count === 0) bonus = -1;
    if (p16count === 1) bonus = 1;
    if (p16count === 2) bonus = 3;

    // Bonus P10
    const top10count = positions.filter(p => p <= 10).length;
    if (top10count === 1) bonus = 5;
    if (top10count === 2) bonus = 10;

    return {
      constructor_id: Number(constructor_id),
      points: total + bonus
    };
  });

  return constructorPoints;
}

module.exports = {
  getQualifyingPoints,
  getSprintPoints,
  getFeaturePoints,
  getConstructorPoints
};
