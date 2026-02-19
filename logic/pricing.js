const db = require("../db");
const { 
  getQualifyingPoints, 
  getSprintPoints, 
  getFeaturePoints 
} = require("./scoring");

// ============================================
// CONSTANTES DU SYSTÈME DE PRIX
// ============================================
const P_MAX = 24.0;           // Prix plafond initial
const E_MAX = 20.0;           // Attente maximale
const K = 0.075;              // Sensibilité du marché
const PLAFOND_VAR = 1.0;      // Variation brute max (±1.0)
const W1_LISSAGE = 0.4;       // Poids du week-end actuel
const W2_LISSAGE = 0.6;       // Poids du week-end précédent
const PRIX_PLANCHER = 4.0;    // Prix minimum absolu
const PRIX_PLAFOND = 30.0;    // Prix maximum absolu

/**
 * Récupère la position finale en Feature Race
 */
async function getFeaturePosition(driver_id, weekendId) {
  const result = await db.query(`
    SELECT finish_position 
    FROM feature_results 
    WHERE driver_id = $1 AND race_weekend_id = $2
  `, [driver_id, weekendId]);
  
  return result.rows[0]?.finish_position || 22; // Si pas de résultat, dernière position
}

/**
 * Calcule le Score de Performance (S_perf)
 * S_perf = Points_F2 + Bonus (uniquement si Points_F2 == 0)
 */
async function calculateSPerf(driver_id, weekendId) {
  // 1. Calcul des Points F2 officiels (Qualif + Sprint + Feature)
  const qualPoints = (await getQualifyingPoints(weekendId)).find(p => p.driver_id === driver_id)?.points || 0;
  const sprintPoints = (await getSprintPoints(weekendId)).find(p => p.driver_id === driver_id)?.points || 0;
  const featurePoints = (await getFeaturePoints(weekendId)).find(p => p.driver_id === driver_id)?.points || 0;
  
  const pointsF2 = qualPoints + sprintPoints + featurePoints;
  
  // 2. Calcul du Bonus de position
  let bonusPosition = 0;

  // Condition : Le bonus ne s'applique QUE si le pilote n'a pas marqué de points F2
  if (pointsF2 === 0) {
    const posFeature = await getFeaturePosition(driver_id, weekendId);
    // On garde ta formule originale pour valoriser les "proches du top 10"
    bonusPosition = ((22 - posFeature) / 22) * 1.5;
  }
  
  // 3. Score final
  const sPerf = pointsF2 + bonusPosition;
  
  return {
    sPerf,
    pointsF2,
    posFeature: pointsF2 === 0 ? await getFeaturePosition(driver_id, weekendId) : null,
    bonusPosition
  };
}

/**
 * Calcule l'Attente de Performance (E)
 * E = (Prix_Actuel / P_max)^2 * E_max
 */
function calculateAttente(prixActuel) {
  return Math.pow(prixActuel / P_MAX, 2) * E_MAX;
}

/**
 * Calcule la variation brute (Δ_brute)
 * Δ_brute = (S_perf - E) * K
 * Limité entre -PLAFOND_VAR et +PLAFOND_VAR
 */
function calculateDeltaBrute(sPerf, attente) {
  const deltaBrute = (sPerf - attente) * K;
  
  // CLAMP entre -1.0 et +1.0
  return Math.max(-PLAFOND_VAR, Math.min(PLAFOND_VAR, deltaBrute));
}

/**
 * Calcule le nouveau prix avec lissage
 */
function calculateNewPrice(prixActuel, deltaBrute, deltaBrutePrecedente, isFirstRound) {
  let nouveauPrix;
  
  if (isFirstRound) {
    // Round 1 : pas de lissage
    nouveauPrix = prixActuel + deltaBrute;
  } else {
    // Round > 1 : lissage avec historique
    const deltaLisse = (deltaBrute * W1_LISSAGE) + (deltaBrutePrecedente * W2_LISSAGE);
    nouveauPrix = prixActuel + deltaLisse;
  }
  
  // Appliquer plancher et plafond
  nouveauPrix = Math.max(PRIX_PLANCHER, Math.min(PRIX_PLAFOND, nouveauPrix));
  
  // Arrondi au centième (2 décimales)
  return Math.round(nouveauPrix * 100) / 100;
}

/**
 * Met à jour le prix d'un pilote après un week-end
 */
async function updateDriverPrice(driver_id, season, weekendId) {
  // 1. Récupérer le prix actuel et delta précédent
  const driverDataResult = await db.query(`
    SELECT price, last_delta 
    FROM driver_seasons 
    WHERE driver_id = $1 AND season = $2
  `, [driver_id, season]);
  
  const driverData = driverDataResult.rows[0];

  if (!driverData) {
    throw new Error(`Driver ${driver_id} not found for season ${season}`);
  }
  
  const prixActuel = driverData.price;
  const deltaBrutePrecedente = driverData.last_delta || 0;
  
  // 2. Vérifier si c'est le premier round de la saison
  const weekendResult = await db.query(`
    SELECT round FROM race_weekends WHERE id = $1
  `, [weekendId]);
  
  const weekend = weekendResult.rows[0];
  const isFirstRound = weekend.round === 1;
  
  // 3. Calculer S_perf
  const { sPerf, pointsF2, posFeature, bonusPosition } = await calculateSPerf(driver_id, weekendId);
  
  // 4. Calculer l'attente E
  const attente = calculateAttente(prixActuel);
  
  // 5. Calculer Δ_brute
  const deltaBrute = calculateDeltaBrute(sPerf, attente);
  
  // 6. Calculer le nouveau prix
  const nouveauPrix = calculateNewPrice(prixActuel, deltaBrute, deltaBrutePrecedente, isFirstRound);
  
  // 7. Mettre à jour la base de données
  await db.query(`
    UPDATE driver_seasons 
    SET price = $1, last_delta = $2 
    WHERE driver_id = $3 AND season = $4
  `, [nouveauPrix, deltaBrute, driver_id, season]);
  
  // 8. Enregistrer dans l'historique
  await db.query(`
    INSERT INTO price_history 
      (driver_id, season, race_weekend_id, price_before, price_after, delta_brute, s_perf, attente)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [driver_id, season, weekendId, prixActuel, nouveauPrix, deltaBrute, sPerf, attente]);
  
  return {
    driver_id,
    prixActuel,
    nouveauPrix,
    deltaBrute,
    deltaBrutePrecedente,
    sPerf,
    pointsF2,
    posFeature,
    bonusPosition,
    attente,
    variation: nouveauPrix - prixActuel
  };
}

/**
 * Met à jour tous les prix des pilotes pour un week-end
 */
async function updateAllDriverPrices(season, weekendId) {
  const driversResult = await db.query(`
    SELECT driver_id 
    FROM driver_seasons 
    WHERE season = $1
  `, [season]);
  
  const results = [];
  
  for (const d of driversResult.rows) {
    try {
      const result = await updateDriverPrice(d.driver_id, season, weekendId);
      results.push(result);
    } catch (err) {
      console.error(`❌ Erreur driver ${d.driver_id}:`, err.message);
    }
  }
  
  return results;
}

/**
 * Met à jour les prix des constructeurs (moyenne des 2 pilotes)
 */
async function updateConstructorPrices(season) {
  const constructorsResult = await db.query(`SELECT id FROM constructors`);
  const result = [];
  
  for (const c of constructorsResult.rows) {
    const pilotsResult = await db.query(`
      SELECT price FROM driver_seasons
      WHERE constructor_id = $1 AND season = $2
      ORDER BY driver_id
      LIMIT 2
    `, [c.id, season]);
    
    const pilots = pilotsResult.rows;
    if (pilots.length === 0) continue;
    
    const prix = pilots.reduce((sum, p) => sum + p.price, 0) / pilots.length;
    const prixArrondi = Math.round(prix * 100) / 100; // Arrondi au centième
    
    await db.query(`UPDATE constructors SET price = $1 WHERE id = $2`, [prixArrondi, c.id]);
    result.push({ constructor_id: c.id, price: prixArrondi });
  }
  
  return result;
}

/**
 * Obtenir l'historique des prix d'un pilote
 */
async function getDriverPriceHistory(driver_id, season) {
  const result = await db.query(`
    SELECT 
      ph.*,
      rw.round,
      rw.name as weekend_name
    FROM price_history ph
    JOIN race_weekends rw ON rw.id = ph.race_weekend_id
    WHERE ph.driver_id = $1 AND ph.season = $2
    ORDER BY rw.round ASC
  `, [driver_id, season]);
  return result.rows;
}

module.exports = {
  updateDriverPrice,
  updateAllDriverPrices,
  updateConstructorPrices,
  getDriverPriceHistory,
  // Exporter les constantes pour tests
  constants: {
    P_MAX,
    E_MAX,
    K,
    PLAFOND_VAR,
    W1_LISSAGE,
    W2_LISSAGE,
    PRIX_PLANCHER,
    PRIX_PLAFOND
  }
};