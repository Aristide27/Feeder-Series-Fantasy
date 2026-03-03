require('dotenv').config();
const db = require('./db');
const { getQualifyingPoints, getSprintPoints, getFeaturePoints } = require('./logic/scoring');

async function testInvictaBonus() {
  const weekendId = 15;
  const season = 2026;
  
  console.log('\n=== TEST INVICTA BONUS ===\n');
  
  // 1. Récupérer les données des pilotes Invicta
  const driversDataResult = await db.query(`
    SELECT 
      wp.driver_id, 
      d.name,
      ds.constructor_id,
      qr.position as qualPosition
    FROM weekend_participants wp
    JOIN drivers d ON d.id = wp.driver_id
    JOIN driver_seasons ds ON ds.driver_id = wp.driver_id AND ds.season = $1
    LEFT JOIN qualifying_results qr ON qr.driver_id = wp.driver_id AND qr.race_weekend_id = wp.race_weekend_id
    WHERE wp.race_weekend_id = $2 AND ds.constructor_id = 1
  `, [season, weekendId]);
  
  const driversData = driversDataResult.rows;
  
  console.log('📊 Données pilotes Invicta:');
  console.table(driversData);
  
  // 2. Récupérer les points
  const qualPoints = Object.fromEntries((await getQualifyingPoints(weekendId)).map(p => [p.driver_id, p.points]));
  const sprintPoints = Object.fromEntries((await getSprintPoints(weekendId)).map(p => [p.driver_id, p.points]));
  const featurePoints = Object.fromEntries((await getFeaturePoints(weekendId)).map(p => [p.driver_id, p.points]));
  
  const driverTotals = driversData.map(d => ({
    driver_id: d.driver_id,
    name: d.name,
    constructor_id: d.constructor_id,
    points: (qualPoints[d.driver_id] || 0) +
            (sprintPoints[d.driver_id] || 0) +
            (featurePoints[d.driver_id] || 0),
    qualPosition: d.qualposition ?? 22
  }));
  
  console.log('\n📈 Totaux pilotes:');
  console.table(driverTotals);
  
  // 3. Calcul du bonus
  const positions = driverTotals.map(d => d.qualPosition);
  const totalPointsPilotes = driverTotals.reduce((sum, d) => sum + d.points, 0);
  
  console.log('\n🎯 Calcul du bonus:');
  console.log('Positions qualif:', positions);
  
  const top10count = positions.filter(p => p <= 10).length;
  const p16count = positions.filter(p => p <= 16).length;
  
  console.log('top10count:', top10count);
  console.log('p16count:', p16count);
  
  let bonus = 0;
  
  if (top10count === 2) {
    bonus = 10;
    console.log('✅ Bonus appliqué: +10 (2 pilotes ≤ P10)');
  } else if (top10count === 1) {
    bonus = 5;
    console.log('✅ Bonus appliqué: +5 (1 pilote ≤ P10)');
  } else if (p16count === 2) {
    bonus = 3;
    console.log('✅ Bonus appliqué: +3 (2 pilotes ≤ P16)');
  } else if (p16count === 1) {
    bonus = 1;
    console.log('✅ Bonus appliqué: +1 (1 pilote ≤ P16)');
  } else {
    bonus = -1;
    console.log('❌ Malus appliqué: -1 (2 pilotes > P16)');
  }
  
  console.log('\n💰 RÉSULTAT FINAL:');
  console.log('Points pilotes:', totalPointsPilotes);
  console.log('Bonus:', bonus);
  console.log('Total écurie:', totalPointsPilotes + bonus);
  console.log('\n✅ Attendu: 72 points (62 + 10)');
  
  process.exit(0);
}

testInvictaBonus().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});