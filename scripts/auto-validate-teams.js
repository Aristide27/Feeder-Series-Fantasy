const db = require("../db");

console.log("[AUTO-VALIDATE] Début de l'auto-validation...\n");

try {
  const season = 2026;
  const now = new Date().toISOString();

  // Récupérer le prochain weekend dont la deadline est dépassée
  const nextWeekend = db.prepare(`
    SELECT id, name, lock_deadline
    FROM race_weekends
    WHERE season = ? AND lock_deadline IS NOT NULL AND lock_deadline <= ?
    ORDER BY round ASC
    LIMIT 1
  `).get(season, now);

  if (!nextWeekend) {
    console.log("Aucun weekend en attente de validation");
    console.log(`   Heure actuelle : ${now}`);
    process.exit(0);
  }

  console.log(`Weekend : ${nextWeekend.name}`);
  console.log(`Deadline : ${nextWeekend.lock_deadline}`);
  console.log(`Maintenant : ${now}`);
  console.log();

  // Valider toutes les équipes non validées pour cette saison
  const result = db.prepare(`
    UPDATE fantasy_teams
    SET is_validated = 1, validated_at = ?
    WHERE season = ? AND is_validated = 0
  `).run(now, season);

  console.log(`${result.changes} équipe(s) validée(s) automatiquement\n`);

  // Afficher les équipes validées
  if (result.changes > 0) {
    const teams = db.prepare(`
      SELECT 
        ft.id,
        ft.name,
        u.username,
        l.name as league_name
      FROM fantasy_teams ft
      JOIN users u ON ft.user_id = u.id
      JOIN leagues l ON ft.league_id = l.id
      WHERE ft.validated_at = ?
    `).all(now);

    console.log("Détails des équipes validées :");
    teams.forEach(t => {
      console.log(`   - ${t.username} : "${t.name}" (${t.league_name})`);
    });
  }

  console.log("\nAuto-validation terminée");
} catch (err) {
  console.error("Erreur lors de l'auto-validation :", err.message);
  process.exit(1);
}