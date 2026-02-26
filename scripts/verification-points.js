#!/usr/bin/env node
require('dotenv').config();
const db = require('../db');
const { 
  getQualifyingPoints, 
  getSprintPoints, 
  getFeaturePoints, 
  getConstructorPoints 
} = require('../logic/scoring');

async function debugSystemePoints(weekendId) {
    console.log(`\nVERIFICATION DU SYSTEME DE POINTS - WEEKEND ID: ${weekendId}\n`);

    try {
        const qualPoints = await getQualifyingPoints(weekendId);
        const sprintPoints = await getSprintPoints(weekendId);
        const featurePoints = await getFeaturePoints(weekendId);
        const constructorPoints = await getConstructorPoints(weekendId);

        const driversResult = await db.query(`
            SELECT d.id, d.name, c.name as team_name 
            FROM drivers d 
            JOIN driver_seasons ds ON d.id = ds.driver_id 
            JOIN constructors c ON ds.constructor_id = c.id
            WHERE ds.season = 2026
        `);

        const drivers = driversResult.rows;

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
        }).filter(p => p.TOTAL > 0 || p["Qualif (Pts)"] !== 0)
          .sort((a, b) => b.TOTAL - a.TOTAL);

        console.log("--- RESULTATS CALCULÉS : PILOTES ---");
        console.table(resumePilotes);

        const teamsResult = await db.query(`SELECT id, name FROM constructors`);
        const teams = teamsResult.rows;

        const resumeEcuries = [];
        
        for (const cp of constructorPoints) {
            const teamName = teams.find(t => t.id === cp.constructor_id)?.name || "Inconnu";
            
            const positionsResult = await db.query(`
                SELECT qr.position 
                FROM qualifying_results qr
                JOIN driver_seasons ds ON qr.driver_id = ds.driver_id
                WHERE ds.constructor_id = $1
                AND qr.race_weekend_id = $2
                AND ds.season = 2026
            `, [cp.constructor_id, weekendId]);

            const positions = positionsResult.rows.map(r => r.position);

            resumeEcuries.push({
                "Écurie": teamName,
                "Positions Qualif": positions.join(" & "),
                "Points Finaux (Bonus incl.)": cp.points
            });
        }

        resumeEcuries.sort((a, b) => b["Points Finaux (Bonus incl.)"] - a["Points Finaux (Bonus incl.)"]);

        console.log("\n--- RESULTATS CALCULÉS : ÉCURIES (AVEC TES BONUS) ---");
        console.table(resumeEcuries);

        process.exit(0);

    } catch (err) {
        console.error("❌ ERREUR:", err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

const weekendId = parseInt(process.argv[2]) || 15;
debugSystemePoints(weekendId);