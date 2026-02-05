const db = require('../db');
const { pointsQualifying, pointsSprint, pointsFeature } = require('./points');

// --------------------
// Points pilotes
// --------------------
function getQualifyingPoints(weekendId) {
  const results = db.prepare(`
    SELECT re.driver_season_id, qr.position, qr.status
    FROM qualifying_results qr
    JOIN race_entries re ON qr.race_entry_id = re.id
    WHERE re.race_weekend_id = ?
  `).all(weekendId);

  return results.map(r => ({
    driver_season_id: r.driver_season_id,
    points: pointsQualifying(r.position, r.status)
  }));
}

function getSprintPoints(weekendId) {
  const results = db.prepare(`
    SELECT re.driver_season_id, sr.finish_position AS position, sr.status, sr.fastest_lap
    FROM sprint_results sr
    JOIN race_entries re ON sr.race_entry_id = re.id
    WHERE re.race_weekend_id = ?
  `).all(weekendId);

  return results.map(r => ({
    driver_season_id: r.driver_season_id,
    points: pointsSprint(r.position, r.status, r.fastest_lap)
  }));
}

function getFeaturePoints(weekendId) {
  const results = db.prepare(`
    SELECT re.driver_season_id, fr.finish_position AS position, fr.status, fr.fastest_lap
    FROM feature_results fr
    JOIN race_entries re ON fr.race_entry_id = re.id
    WHERE re.race_weekend_id = ?
  `).all(weekendId);

  return results.map(r => ({
    driver_season_id: r.driver_season_id,
    points: pointsFeature(r.position, r.status, r.fastest_lap)
  }));
}

// --------------------
// Points constructeurs
// --------------------
function getConstructorPoints(weekendId) {
  // Récupérer tous les pilotes actifs ayant une entrée ce weekend
  const drivers = db.prepare(`
    SELECT ds.id AS driver_season_id, ds.constructor_id
    FROM driver_seasons ds
    JOIN race_entries re ON re.driver_season_id = ds.id
    WHERE re.race_weekend_id = ?
  `).all(weekendId);

  // Récupérer points pilotes
  const qualPoints = Object.fromEntries(getQualifyingPoints(weekendId).map(p => [p.driver_season_id, p.points]));
  const sprintPoints = Object.fromEntries(getSprintPoints(weekendId).map(p => [p.driver_season_id, p.points]));
  const featurePoints = Object.fromEntries(getFeaturePoints(weekendId).map(p => [p.driver_season_id, p.points]));

  // Total points pilotes par driver_season
  const driverTotals = drivers.map(d => ({
    driver_season_id: d.driver_season_id,
    constructor_id: d.constructor_id,
    points: (qualPoints[d.driver_season_id] || 0) +
            (sprintPoints[d.driver_season_id] || 0) +
            (featurePoints[d.driver_season_id] || 0),
    qualPosition: db.prepare(`
      SELECT qr.position
      FROM qualifying_results qr
      JOIN race_entries re ON qr.race_entry_id = re.id
      WHERE re.driver_season_id = ? AND re.race_weekend_id = ?
    `).get(d.driver_season_id, weekendId)?.position ?? 20
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
