const db = require("../db");
const bcrypt = require("bcrypt");

console.log("=== AJOUT D'UTILISATEURS DE TEST ===\n");

// Utilisateurs de test avec des scores variés
const testUsers = [
  { username: "ChampionMax", email: "max@test.com", points: 1500 },
  { username: "SpeedRacer", email: "speed@test.com", points: 1350 },
  { username: "PolePosition", email: "pole@test.com", points: 1200 },
  { username: "FastLap", email: "fast@test.com", points: 1050 },
  { username: "RocketStart", email: "rocket@test.com", points: 950 },
  { username: "TyreWhisperer", email: "tyre@test.com", points: 890 },
  { username: "ApexHunter", email: "apex@test.com", points: 820 },
  { username: "OvertkingKing", email: "overtake@test.com", points: 750 },
  { username: "GridMaster", email: "grid@test.com", points: 680 },
  { username: "PitPerfect", email: "pit@test.com", points: 620 },
];

try {
  // Récupérer la ligue FSF
  const fsfLeague = db.prepare("SELECT id FROM leagues WHERE code = 'FSF'").get();
  
  if (!fsfLeague) {
    console.error("✗ Erreur : La ligue FSF n'existe pas !");
    console.log("  Exécutez d'abord : node db/create-fsf-league.js");
    process.exit(1);
  }

  const password = "test123"; // Mot de passe simple pour tous les utilisateurs de test
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  let created = 0;
  let skipped = 0;

  for (const testUser of testUsers) {
    // Vérifier si l'utilisateur existe déjà
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(testUser.username);
    
    if (existing) {
      console.log(`⊘ ${testUser.username} existe déjà`);
      skipped++;
      continue;
    }

    // Créer l'utilisateur
    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `).run(testUser.username, testUser.email, hashedPassword);
    
    const userId = result.lastInsertRowid;

    // L'ajouter à la ligue FSF
    db.prepare(`
      INSERT INTO league_members (league_id, user_id)
      VALUES (?, ?)
    `).run(fsfLeague.id, userId);

    // Initialiser son score
    db.prepare(`
      INSERT INTO league_scores (league_id, user_id, total_points)
      VALUES (?, ?, ?)
    `).run(fsfLeague.id, userId, testUser.points);

    console.log(`✓ ${testUser.username} créé avec ${testUser.points} points`);
    created++;
  }

  console.log("\n=== RÉSUMÉ ===");
  console.log(`✓ ${created} utilisateur(s) créé(s)`);
  if (skipped > 0) {
    console.log(`  ${skipped} utilisateur(s) déjà existant(s)`);
  }
  
  // Afficher le classement
  console.log("\n=== TOP 5 DU CLASSEMENT ===");
  const top5 = db.prepare(`
    SELECT 
      u.username,
      ls.total_points,
      ROW_NUMBER() OVER (ORDER BY ls.total_points DESC) as rank
    FROM league_scores ls
    JOIN users u ON ls.user_id = u.id
    WHERE ls.league_id = ?
    ORDER BY ls.total_points DESC
    LIMIT 5
  `).all(fsfLeague.id);

  top5.forEach(user => {
    const medal = user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : "  ";
    console.log(`${medal} #${user.rank} - ${user.username}: ${user.total_points} pts`);
  });

  console.log("\n=== SUCCÈS ===");
  console.log("Vous pouvez maintenant voir le podium sur la page Rankings !");
  console.log("\nInfos de connexion pour tester :");
  console.log("  Username: ChampionMax (ou n'importe quel autre)");
  console.log("  Password: test123");

} catch (err) {
  console.error("\n✗ ERREUR :", err.message);
  console.error(err);
}