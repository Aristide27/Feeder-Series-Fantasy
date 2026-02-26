require('dotenv').config();
const db = require("../db");
const bcrypt = require("bcrypt");

console.log("=== AJOUT D'UTILISATEURS DE TEST ===\n");

const testUsers = [
  { username: "ChampionMax", email: "max@test.com", points: 1500 },
  { username: "SpeedRacer", email: "speed@test.com", points: 1350 },
  { username: "PolePosition", email: "pole@test.com", points: 1200 },
  { username: "FastLap", email: "fast@test.com", points: 1050 },
  { username: "RocketStart", email: "rocket@test.com", points: 950 },
  { username: "TyreWhisperer", email: "tyre@test.com", points: 890 },
  { username: "ApexHunter", email: "apex@test.com", points: 820 },
  { username: "OvertakingKing", email: "overtake@test.com", points: 750 },
  { username: "GridMaster", email: "grid@test.com", points: 680 },
  { username: "PitPerfect", email: "pit@test.com", points: 620 },
];

async function addTestUsers() {
  try {
    const fsfLeagueResult = await db.query("SELECT id FROM leagues WHERE code = 'FSF'");
    
    if (fsfLeagueResult.rows.length === 0) {
      console.error("✗ Erreur : La ligue FSF n'existe pas !");
      console.log("  Elle devrait avoir été créée par seed.js");
      process.exit(1);
    }

    const fsfLeague = fsfLeagueResult.rows[0];
    const password = "test123";
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    let created = 0;
    let skipped = 0;

    for (const testUser of testUsers) {
      const existingResult = await db.query(
        "SELECT id FROM users WHERE username = $1", 
        [testUser.username]
      );
      
      if (existingResult.rows.length > 0) {
        console.log(`⊘ ${testUser.username} existe déjà`);
        skipped++;
        continue;
      }

      const userResult = await db.query(`
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [testUser.username, testUser.email, hashedPassword]);
      
      const userId = userResult.rows[0].id;

      await db.query(`
        INSERT INTO league_members (league_id, user_id)
        VALUES ($1, $2)
      `, [fsfLeague.id, userId]);

      await db.query(`
        INSERT INTO league_scores (league_id, user_id, total_points)
        VALUES ($1, $2, $3)
      `, [fsfLeague.id, userId, testUser.points]);

      console.log(`✓ ${testUser.username} créé avec ${testUser.points} points`);
      created++;
    }

    console.log("\n=== RÉSUMÉ ===");
    console.log(`✓ ${created} utilisateur(s) créé(s)`);
    if (skipped > 0) {
      console.log(`  ${skipped} utilisateur(s) déjà existant(s)`);
    }
    
    console.log("\n=== TOP 5 DU CLASSEMENT ===");
    const top5Result = await db.query(`
      SELECT 
        u.username,
        ls.total_points,
        ROW_NUMBER() OVER (ORDER BY ls.total_points DESC) as rank
      FROM league_scores ls
      JOIN users u ON ls.user_id = u.id
      WHERE ls.league_id = $1
      ORDER BY ls.total_points DESC
      LIMIT 5
    `, [fsfLeague.id]);

    top5Result.rows.forEach(user => {
      const medal = user.rank === "1" ? "🥇" : user.rank === "2" ? "🥈" : user.rank === "3" ? "🥉" : "  ";
      console.log(`${medal} #${user.rank} - ${user.username}: ${user.total_points} pts`);
    });

    console.log("\n=== SUCCÈS ===");
    console.log("Vous pouvez maintenant voir le podium sur la page Rankings !");
    console.log("\nInfos de connexion pour tester :");
    console.log("  Username: ChampionMax (ou n'importe quel autre)");
    console.log("  Password: test123");

    process.exit(0);

  } catch (err) {
    console.error("\n✗ ERREUR :", err.message);
    console.error(err);
    process.exit(1);
  }
}

addTestUsers();