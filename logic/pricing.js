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
function getFeaturePosition(driver_id, weekendId) {
  const result = db.prepare(`
    SELECT finish_position 
    FROM feature_results 
    WHERE driver_id = ? AND race_weekend_id = ?
  `).get(driver_id, weekendId);
  
  return result?.finish_position || 22; // Si pas de résultat, dernière position
}

/**
 * Calcule le Score de Performance (S_perf)
 * S_perf = Points_F2 + ((22 - Pos_Feature) / 22 * 1.5)
 */
function calculateSPerf(driver_id, weekendId) {
  // Points F2 officiels
  const qualPoints = getQualifyingPoints(weekendId).find(p => p.driver_id === driver_id)?.points || 0;
  const sprintPoints = getSprintPoints(weekendId).find(p => p.driver_id === driver_id)?.points || 0;
  const featurePoints = getFeaturePoints(weekendId).find(p => p.driver_id === driver_id)?.points || 0;
  
  const pointsF2 = qualPoints + sprintPoints + featurePoints;
  
  // Bonus position Feature
  const posFeature = getFeaturePosition(driver_id, weekendId);
  const bonusPosition = ((22 - posFeature) / 22) * 1.5;
  
  const sPerf = pointsF2 + bonusPosition;
  
  return {
    sPerf,
    pointsF2,
    posFeature,
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
  
  return nouveauPrix;
}

/**
 * Met à jour le prix d'un pilote après un week-end
 */
function updateDriverPrice(driver_id, season, weekendId) {
  // 1. Récupérer le prix actuel et delta précédent
  const driverData = db.prepare(`
    SELECT price, last_delta 
    FROM driver_seasons 
    WHERE driver_id = ? AND season = ?
  `).get(driver_id, season);
  
  if (!driverData) {
    throw new Error(`Driver ${driver_id} not found for season ${season}`);
  }
  
  const prixActuel = driverData.price;
  const deltaBrutePrecedente = driverData.last_delta || 0;
  
  // 2. Vérifier si c'est le premier round de la saison
  const weekend = db.prepare(`
    SELECT round FROM race_weekends WHERE id = ?
  `).get(weekendId);
  
  const isFirstRound = weekend.round === 1;
  
  // 3. Calculer S_perf
  const { sPerf, pointsF2, posFeature, bonusPosition } = calculateSPerf(driver_id, weekendId);
  
  // 4. Calculer l'attente E
  const attente = calculateAttente(prixActuel);
  
  // 5. Calculer Δ_brute
  const deltaBrute = calculateDeltaBrute(sPerf, attente);
  
  // 6. Calculer le nouveau prix
  const nouveauPrix = calculateNewPrice(prixActuel, deltaBrute, deltaBrutePrecedente, isFirstRound);
  
  // 7. Mettre à jour la base de données
  db.prepare(`
    UPDATE driver_seasons 
    SET price = ?, last_delta = ? 
    WHERE driver_id = ? AND season = ?
  `).run(nouveauPrix, deltaBrute, driver_id, season);
  
  // 8. Enregistrer dans l'historique
  db.prepare(`
    INSERT INTO price_history 
      (driver_id, season, race_weekend_id, price_before, price_after, delta_brute, s_perf, attente)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(driver_id, season, weekendId, prixActuel, nouveauPrix, deltaBrute, sPerf, attente);
  
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
function updateAllDriverPrices(season, weekendId) {
  const drivers = db.prepare(`
    SELECT driver_id 
    FROM driver_seasons 
    WHERE season = ?
  `).all(season);
  
  const results = [];
  
  for (const d of drivers) {
    try {
      const result = updateDriverPrice(d.driver_id, season, weekendId);
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
function updateConstructorPrices(season) {
  const constructors = db.prepare(`SELECT id FROM constructors`).all();
  const result = [];
  
  for (const c of constructors) {
    const pilots = db.prepare(`
      SELECT price FROM driver_seasons
      WHERE constructor_id = ? AND season = ?
      ORDER BY driver_id
      LIMIT 2
    `).all(c.id, season);
    
    if (pilots.length === 0) continue;
    
    const prix = pilots.reduce((sum, p) => sum + p.price, 0) / pilots.length;
    
    db.prepare(`UPDATE constructors SET price = ? WHERE id = ?`).run(prix, c.id);
    result.push({ constructor_id: c.id, price: prix });
  }
  
  return result;
}

/**
 * Obtenir l'historique des prix d'un pilote
 */
function getDriverPriceHistory(driver_id, season) {
  return db.prepare(`
    SELECT 
      ph.*,
      rw.round,
      rw.name as weekend_name
    FROM price_history ph
    JOIN race_weekends rw ON rw.id = ph.race_weekend_id
    WHERE ph.driver_id = ? AND ph.season = ?
    ORDER BY rw.round ASC
  `).all(driver_id, season);
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