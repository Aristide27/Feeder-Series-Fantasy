const db = require('../db');
const { pointsQualifying, pointsSprint, pointsFeature } = require('./points');

// --------------------
// Points pilotes (avec capitaine)
// --------------------

async function getQualifyingPoints(weekendId, fantasyTeamId = null) {
  const result = await db.query(`
    SELECT qr.driver_id, qr.position, qr.status
    FROM qualifying_results qr
    WHERE qr.race_weekend_id = $1
  `, [weekendId]);

  // ✅ Récupérer le capitaine si fantasyTeamId fourni
  let captainDriverId = null;
  if (fantasyTeamId) {
    const captainResult = await db.query(`
      SELECT driver_id FROM fantasy_picks 
      WHERE fantasy_team_id = $1 AND is_captain = 1
      LIMIT 1
    `, [fantasyTeamId]);
    captainDriverId = captainResult.rows[0]?.driver_id || null;
  }

  return result.rows.map(r => {
    let points = pointsQualifying(r.position, r.status);
    
    // ✅ Doubler si capitaine
    if (captainDriverId && r.driver_id === captainDriverId) {
      points *= 2;
    }
    
    return {
      driver_id: r.driver_id,
      points
    };
  });
}

async function getSprintPoints(weekendId, fantasyTeamId = null) {
  const result = await db.query(`
    SELECT sr.driver_id, sr.finish_position AS position, sr.status, sr.fastest_lap
    FROM sprint_results sr
    WHERE sr.race_weekend_id = $1
  `, [weekendId]);

  // ✅ Récupérer le capitaine
  let captainDriverId = null;
  if (fantasyTeamId) {
    const captainResult = await db.query(`
      SELECT driver_id FROM fantasy_picks 
      WHERE fantasy_team_id = $1 AND is_captain = 1
      LIMIT 1
    `, [fantasyTeamId]);
    captainDriverId = captainResult.rows[0]?.driver_id || null;
  }

  return result.rows.map(r => {
    let points = pointsSprint(r.position, r.status, r.fastest_lap);
    
    // ✅ Doubler si capitaine
    if (captainDriverId && r.driver_id === captainDriverId) {
      points *= 2;
    }
    
    return {
      driver_id: r.driver_id,
      points
    };
  });
}

async function getFeaturePoints(weekendId, fantasyTeamId = null) {
  const result = await db.query(`
    SELECT fr.driver_id, fr.finish_position AS position, fr.status, fr.fastest_lap
    FROM feature_results fr
    WHERE fr.race_weekend_id = $1
  `, [weekendId]);

  // ✅ Récupérer le capitaine
  let captainDriverId = null;
  if (fantasyTeamId) {
    const captainResult = await db.query(`
      SELECT driver_id FROM fantasy_picks 
      WHERE fantasy_team_id = $1 AND is_captain = 1
      LIMIT 1
    `, [fantasyTeamId]);
    captainDriverId = captainResult.rows[0]?.driver_id || null;
  }

  return result.rows.map(r => {
    let points = pointsFeature(r.position, r.status, r.fastest_lap);
    
    // ✅ Doubler si capitaine
    if (captainDriverId && r.driver_id === captainDriverId) {
      points *= 2;
    }
    
    return {
      driver_id: r.driver_id,
      points
    };
  });
}

// --------------------
// Points constructeurs (pas de capitaine ici)
// --------------------
async function getConstructorPoints(weekendId) {
  const season = 2026;
  
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
  
  // ✅ Ici on ne passe PAS de fantasyTeamId car les constructeurs n'ont pas de capitaine
  const qualPoints = Object.fromEntries((await getQualifyingPoints(weekendId)).map(p => [p.driver_id, p.points]));
  const sprintPoints = Object.fromEntries((await getSprintPoints(weekendId)).map(p => [p.driver_id, p.points]));
  const featurePoints = Object.fromEntries((await getFeaturePoints(weekendId)).map(p => [p.driver_id, p.points]));
  
  const driverTotals = driversData.map(d => ({
    driver_id: d.driver_id,
    constructor_id: d.constructor_id,
    points: (qualPoints[d.driver_id] || 0) +
            (sprintPoints[d.driver_id] || 0) +
            (featurePoints[d.driver_id] || 0),
    qualPosition: d.qualPosition ?? 22
  }));
  
  const constructors = {};
  driverTotals.forEach(d => {
    if (!constructors[d.constructor_id]) constructors[d.constructor_id] = [];
    constructors[d.constructor_id].push(d);
  });
  
  return Object.entries(constructors).map(([constructor_id, drs]) => {
    const d1 = drs[0];
    const d2 = drs[1];
    const totalPointsPilotes = (d1?.points || 0) + (d2?.points || 0);
    
    const positions = drs.map(d => d.qualPosition);
    let bonus = 0;
    
    const p16count = positions.filter(p => p <= 16).length;
    if (p16count === 0) bonus = -1;
    else if (p16count === 1) bonus = 1;
    else if (p16count === 2) bonus = 3;
    
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