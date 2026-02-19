const db = require('../db');
const { pointsQualifying, pointsSprint, pointsFeature } = require('./points');
// --------------------
// Points pilotes
// --------------------
async function getQualifyingPoints(weekendId) {
  const result = await db.query(`
    SELECT qr.driver_id, qr.position, qr.status
    FROM qualifying_results qr
    WHERE qr.race_weekend_id = $1
  `, [weekendId]);
  return result.rows.map(r => ({
    driver_id: r.driver_id,
    points: pointsQualifying(r.position, r.status)
  }));
}
async function getSprintPoints(weekendId) {
  const result = await db.query(`
    SELECT sr.driver_id, sr.finish_position AS position, sr.status, sr.fastest_lap
    FROM sprint_results sr
    WHERE sr.race_weekend_id = $1
  `, [weekendId]);
  return result.rows.map(r => ({
    driver_id: r.driver_id,
    points: pointsSprint(r.position, r.status, r.fastest_lap)
  }));
}
async function getFeaturePoints(weekendId) {
  const result = await db.query(`
    SELECT fr.driver_id, fr.finish_position AS position, fr.status, fr.fastest_lap
    FROM feature_results fr
    WHERE fr.race_weekend_id = $1
  `, [weekendId]);
  return result.rows.map(r => ({
    driver_id: r.driver_id,
    points: pointsFeature(r.position, r.status, r.fastest_lap)
  }));
}
// --------------------
// Points constructeurs
// --------------------
async function getConstructorPoints(weekendId) {
  const season = 2026;
  // 1. On récupère les pilotes, leur écurie ET leur position de qualif en une seule fois
  const driversDataResult = await db.query(`
    SELECT 
      wp.driver_id, 
      ds.constructor_id,
      qr.position as qualPosition
    FROM weekend_participants wp
    JOIN driver_seasons ds ON ds.driver_id = wp.driver_id AND ds.season = $1
    LEFT JOIN qualifying_results qr ON qr.driver_id = wp.driver_id AND qr.race_weekend_id = wp.race_weekend_id
    WHERE wp.race_weekend_id = $2
  `, [season, weekendId]);
  const driversData = driversDataResult.rows;
  // 2. Récupérer les points calculés par tes fonctions pilotes
  const qualPoints = Object.fromEntries((await getQualifyingPoints(weekendId)).map(p => [p.driver_id, p.points]));
  const sprintPoints = Object.fromEntries((await getSprintPoints(weekendId)).map(p => [p.driver_id, p.points]));
  const featurePoints = Object.fromEntries((await getFeaturePoints(weekendId)).map(p => [p.driver_id, p.points]));
  // 3. Total points pilotes
  const driverTotals = driversData.map(d => ({
    driver_id: d.driver_id,
    constructor_id: d.constructor_id,
    points: (qualPoints[d.driver_id] || 0) +
            (sprintPoints[d.driver_id] || 0) +
            (featurePoints[d.driver_id] || 0),
    qualPosition: d.qualPosition ?? 22 // On met 22 si pas de qualif (DNS/DSQ)
  }));
  // 4. Grouper par constructeur
  const constructors = {};
  driverTotals.forEach(d => {
    if (!constructors[d.constructor_id]) constructors[d.constructor_id] = [];
    constructors[d.constructor_id].push(d);
  });
  // 5. Calcul points constructeur avec bonus/malus
  return Object.entries(constructors).map(([constructor_id, drs]) => {
    // Sécurité au cas où une écurie n'a qu'un pilote (ex: forfait)
    const d1 = drs[0];
    const d2 = drs[1];
    const totalPointsPilotes = (d1?.points || 0) + (d2?.points || 0);
    // Extraction des positions de qualifs
    const positions = drs.map(d => d.qualPosition);
    let bonus = 0;
    // Logique P16 (Malus si aucun dans le top 16, Bonus sinon)
    const p16count = positions.filter(p => p <= 16).length;
    if (p16count === 0) bonus = -1;
    else if (p16count === 1) bonus = 1;
    else if (p16count === 2) bonus = 3;
    // Bonus P10
    const top10count = positions.filter(p => p <= 10).length;
    if (top10count === 1) bonus += 5;
    else if (top10count === 2) bonus += 10;
    return {
      constructor_id: Number(constructor_id),
      points: totalPointsPilotes + bonus
    };
  });
}
module.exports = {
  getQualifyingPoints,
  getSprintPoints,
  getFeaturePoints,
  getConstructorPoints
};