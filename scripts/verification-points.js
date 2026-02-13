const db = require('../db');
const { 
  getQualifyingPoints, 
  getSprintPoints, 
  getFeaturePoints, 
  getConstructorPoints 
} = require('../logic/scoring');

async function debugSystemePoints(weekendId) {
    console.log(`\nVERIFICATION DU SYSTEME DE POINTS - WEEKEND ID: ${weekendId}\n`);

    // 1. Récupération des données via TES fonctions
    const qualPoints = getQualifyingPoints(weekendId);
    const sprintPoints = getSprintPoints(weekendId);
    const featurePoints = getFeaturePoints(weekendId);
    const constructorPoints = getConstructorPoints(weekendId);

    // 2. Préparation du tableau Pilotes
    // On récupère les noms pour que ce soit lisible
    const drivers = db.prepare(`
        SELECT d.id, d.name, c.name as team_name 
        FROM drivers d 
        JOIN driver_seasons ds ON d.id = ds.driver_id 
        JOIN constructors c ON ds.constructor_id = c.id
        WHERE ds.season = 2026
    `).all();

    const resumePilotes = drivers.map(d => {
        const q = qualPoints.find(p => p.driver_id === d.id)?.points || 0;
        const s = sprintPoints.find(p => p.driver_id === d.id)?.points || 0;
        const f = featurePoints.find(p => p.driver_id === d.id)?.points || 0;
        
        return {
            "Pilote": d.name,
            "Écurie": d.team_name,
            "Qualif (Pts)": q,
            "Sprint (Pts)": s,
            "Feature (Pts)": f,
            "TOTAL": q + s + f
        };
    }).filter(p => p.TOTAL > 0 || p["Qualif (Pts)"] !== 0) // On n'affiche que ceux qui ont bougé
      .sort((a, b) => b.TOTAL - a.TOTAL);

    console.log("--- RESULTATS CALCULÉS : PILOTES ---");
    console.table(resumePilotes);

    // 3. Préparation du tableau Écuries
    const teams = db.prepare(`SELECT id, name FROM constructors`).all();

    const resumeEcuries = constructorPoints.map(cp => {
        const teamName = teams.find(t => t.id === cp.constructor_id)?.name || "Inconnu";
        
        // On récupère les positions de qualif pour vérifier tes bonus (P16/Top10)
        const positions = db.prepare(`
            SELECT qr.position 
            FROM qualifying_results qr
            JOIN driver_seasons ds ON qr.driver_id = ds.driver_id
            WHERE ds.constructor_id = ? 
            AND qr.race_weekend_id = ?
            AND ds.season = 2026
        `).all(cp.constructor_id, weekendId).map(r => r.position);

        return {
            "Écurie": teamName,
            "Positions Qualif": positions.join(" & "),
            "Points Finaux (Bonus incl.)": cp.points
        };
    }).sort((a, b) => b["Points Finaux (Bonus incl.)"] - a["Points Finaux (Bonus incl.)"]);

    console.log("\n--- RESULTATS CALCULÉS : ÉCURIES (AVEC TES BONUS) ---");
    console.table(resumeEcuries);
}

// Lancer la vérification
debugSystemePoints(15); // Change par l'ID du weekend que tu veux vérifier