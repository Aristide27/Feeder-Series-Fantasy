const db = require("../db");
const { 
  getQualifyingPoints, 
  getSprintPoints, 
  getFeaturePoints 
} = require("./scoring");

const PRIX_MIN = 4.0;
const PRIX_MAX = 30.0;
const K_DELTA = 0.22;
const MAX_DELTA_PCT = 0.1; // ±10% par GP

// -----------------------------------------------
// Calcul du FPS total d'un pilote pour un weekend
// -----------------------------------------------
function getFPS(driver_season_id, weekendId) {
  const qualPoints = getQualifyingPoints(weekendId).find(p => p.driver_season_id === driver_season_id)?.points || 0;
  const sprintPoints = getSprintPoints(weekendId).find(p => p.driver_season_id === driver_season_id)?.points || 0;
  const featurePoints = getFeaturePoints(weekendId).find(p => p.driver_season_id === driver_season_id)?.points || 0;

  return qualPoints + sprintPoints + featurePoints;
}

// ----------------------------------------
// Mise à jour du rating + prix d'un pilote
// ----------------------------------------
function updateRating(driver_season_id, weekendId) {
  const FPS = getFPS(driver_season_id, weekendId);

  // récupère rating et prix précédent
  const prev = db.prepare(`SELECT rating, price FROM driver_seasons WHERE id = ?`).get(driver_season_id);
  const rating_precedent = prev?.rating ?? FPS; // premier GP

  const rating_nouveau = 0.3 * FPS + 0.7 * rating_precedent;

  // normalisation
  const minMax = db.prepare(`SELECT MIN(rating) as min_rating, MAX(rating) as max_rating FROM driver_seasons`).get();
  const rating_normalise = (rating_nouveau - minMax.min_rating) / Math.max(1, minMax.max_rating - minMax.min_rating);

  // delta plafonné
  let delta = K_DELTA * (rating_nouveau - rating_precedent) * (1 - rating_normalise);
  const prix_actuel = prev?.price ?? PRIX_MIN;
  const maxDelta = prix_actuel * MAX_DELTA_PCT;
  delta = Math.max(Math.min(delta, maxDelta), -maxDelta);

  // prix final
  let prix_final = prix_actuel + delta;
  prix_final = Math.min(Math.max(prix_final, PRIX_MIN), PRIX_MAX);

  // update DB
  db.prepare(`UPDATE driver_seasons SET rating = ?, price = ? WHERE id = ?`)
    .run(rating_nouveau, prix_final, driver_season_id);

  return { rating: rating_nouveau, price: prix_final, delta };
}

// -------------------------------
// Mise à jour de tous les pilotes
// -------------------------------
function updateAllDriverPrices(weekendId) {
  const drivers = db.prepare(`SELECT id FROM driver_seasons`).all();
  return drivers.map(d => ({ driver_season_id: d.id, ...updateRating(d.id, weekendId) }));
}

// ----------------------------------
// Mise à jour des prix constructeurs
// ----------------------------------
function updateConstructorPrices() {
  const constructors = db.prepare(`SELECT id FROM constructors`).all();
  const result = [];

  for (const c of constructors) {
    const pilots = db.prepare(`
      SELECT price FROM driver_seasons
      WHERE constructor_id = ?
      ORDER BY id
      LIMIT 2
    `).all(c.id);

    const prix = ((pilots[0]?.price ?? PRIX_MIN) + (pilots[1]?.price ?? PRIX_MIN)) / 2;

    db.prepare(`UPDATE constructors SET price = ? WHERE id = ?`).run(prix, c.id);
    result.push({ constructor_id: c.id, price: prix });
  }

  return result;
}

module.exports = {
  updateRating,
  updateAllDriverPrices,
  updateConstructorPrices,
};
