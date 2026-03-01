require('dotenv').config();
const db = require("../db");
const bcrypt = require("bcrypt");

console.log("=== AJOUT D'UTILISATEURS DE TEST ===\n");

const testUsers = [
{ username: "LucasMartin", email: "lucas.martin@test.com", points: 0 },
{ username: "TheoRacing22", email: "theo22@test.com", points: 0 },
{ username: "Enzo_Dubois", email: "enzo.dubois@test.com", points: 0 },
{ username: "MaximeLefevre7", email: "maxime7@test.com", points: 0 },
{ username: "HugoBernard", email: "hugo.bernard@test.com", points: 0 },
{ username: "RomainGiraud", email: "romain.g@test.com", points: 0 },
{ username: "NicolasRoux", email: "nicolas.roux@test.com", points: 0 },
{ username: "JulienMorel_91", email: "julien91@test.com", points: 0 },
{ username: "AntoinePetit", email: "antoine.p@test.com", points: 0 },
{ username: "AlexandreLemaire", email: "alex.lemaire@test.com", points: 0 },

{ username: "ApexAddict", email: "apex.addict@test.com", points: 0 },
{ username: "DRS_Master", email: "drs.master@test.com", points: 0 },
{ username: "LateBraker", email: "late.braker@test.com", points: 0 },
{ username: "ChicaneHunter", email: "chicane@test.com", points: 0 },
{ username: "FullThrottleX", email: "throttle@test.com", points: 0 },
{ username: "PitlanePro", email: "pitlane@test.com", points: 0 },
{ username: "TurboVictor", email: "turbo.v@test.com", points: 0 },
{ username: "SafetyCarSam", email: "safety.sam@test.com", points: 0 },
{ username: "SlipstreamSeb", email: "slipstream@test.com", points: 0 },
{ username: "GridLegend44", email: "grid44@test.com", points: 0 },
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