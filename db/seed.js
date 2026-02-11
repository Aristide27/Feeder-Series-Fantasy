// const db = require("../db");
// const fs = require("fs");
// const path = require("path");

// function runSQLFile(filePath) {
//   if (!fs.existsSync(filePath)) {
//     console.log("⚠️  Fichier SQL non trouvé :", filePath);
//     return;
//   }
//   const sql = fs.readFileSync(filePath, "utf-8");
//   try {
//     db.exec(sql);
//     // console.log("✓ SQL exécuté :", filePath);
//   } catch (err) {
//     console.error("✗ Erreur SQL :", filePath);
//     console.error(err.message);
//   }
// }

// function loadWeekendFolder(weekendPath, folderName) {
//   console.log("  ↳ Chargement du weekend :", folderName);

//   runSQLFile(path.join(weekendPath, "00_weekend.sql"));
//   runSQLFile(path.join(weekendPath, "01_participants.sql"));
//   runSQLFile(path.join(weekendPath, "02_qualifying.sql"));
//   runSQLFile(path.join(weekendPath, "03_sprint.sql"));
//   runSQLFile(path.join(weekendPath, "04_feature.sql"));
// }

// function loadSeasonWeekends(season) {
//   const weekendsDir = path.join(__dirname, `seeds/${season}/weekends`);

//   if (!fs.existsSync(weekendsDir)) {
//     console.log(`⚠️  Pas de dossier weekends pour ${season} :`, weekendsDir);
//     return;
//   }

//   const weekendFolders = fs
//     .readdirSync(weekendsDir)
//     .filter((f) => fs.statSync(path.join(weekendsDir, f)).isDirectory())
//     .sort((a, b) => a.localeCompare(b, "en", { numeric: true })); // tri 1,2,10...

//   console.log(`\n=== Weekends ${season} (${weekendFolders.length}) ===`);

//   for (const folder of weekendFolders) {
//     const weekendPath = path.join(weekendsDir, folder);
//     loadWeekendFolder(weekendPath, folder);
//   }
// }

// runSQLFile(path.join(__dirname, "seeds/constructors.sql"));
// runSQLFile(path.join(__dirname, "seeds/drivers.sql"));
// runSQLFile(path.join(__dirname, "seeds/2025/driver_seasons.sql"));
// runSQLFile(path.join(__dirname, "seeds/2026/driver_seasons.sql"));

// loadSeasonWeekends(2025);
// loadSeasonWeekends(2026);

// try {
//   const existingLeague = db.prepare("SELECT id FROM leagues WHERE code = 'FSF'").get();

//   if (!existingLeague) {
//     // Vérifier / créer l'utilisateur système (id = 1)
//     let systemUser = db.prepare("SELECT id FROM users WHERE id = 1").get();

//     if (!systemUser) {
//       const bcrypt = require("bcrypt");
//       const hashedPassword = bcrypt.hashSync("system_password_secure_123", 10);

//       const res = db.prepare(`
//         INSERT INTO users (username, email, password_hash)
//         VALUES ('FSF_System', NULL, ?)
//       `).run(hashedPassword);

//       systemUser = { id: res.lastInsertRowid };
//     }

//     const result = db.prepare(`
//       INSERT INTO leagues (name, code, creator_id, is_official)
//       VALUES ('FSF Officiel', 'FSF', ?, 1)
//     `).run(systemUser.id);

//     console.log("✓ Ligue FSF Officiel créée (id:", result.lastInsertRowid, ")");
//   } else {
//     console.log("\n✓ Ligue FSF Officiel déjà existante");
//   }
// } catch (err) {
//   console.error("✗ Erreur création ligue FSF :", err.message);
// }

// console.log("\nTous les seeds chargés !");


const db = require("../db");
const fs = require("fs");
const path = require("path");

function runSQLFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log("⚠️  Fichier SQL non trouvé :", filePath);
    return;
  }
  const sql = fs.readFileSync(filePath, "utf-8");
  try {
    db.exec(sql);
  } catch (err) {
    console.error("✗ Erreur SQL :", filePath);
    console.error(err.message);
  }
}

function loadWeekendFolder(weekendPath, folderName, season, round) {
  console.log(`  ↳ Chargement du weekend : ${folderName}`);
  
  // 1. Créer le weekend d'abord
  runSQLFile(path.join(weekendPath, "00_weekend.sql"));
  
  // 2. Récupérer l'ID du weekend qu'on vient de créer
  const weekendResult = db.prepare(`
    SELECT id FROM race_weekends 
    WHERE season = ? AND round = ?
  `).get(season, round);
  
  if (!weekendResult) {
    console.error(`  ✗ Weekend ${season} R${round} non trouvé après insertion`);
    return;
  }
  
  const weekendId = weekendResult.id;
  
  // 3. Charger les résultats
  runSQLFile(path.join(weekendPath, "01_participants.sql"));
  runSQLFile(path.join(weekendPath, "02_qualifying.sql"));
  runSQLFile(path.join(weekendPath, "03_sprint.sql"));
  runSQLFile(path.join(weekendPath, "04_feature.sql"));
}

function loadSeasonWeekends(season) {
  const weekendsDir = path.join(__dirname, `seeds/${season}/weekends`);
  
  if (!fs.existsSync(weekendsDir)) {
    console.log(`⚠️  Pas de dossier weekends pour ${season} :`, weekendsDir);
    return;
  }
  
  const weekendFolders = fs
    .readdirSync(weekendsDir)
    .filter((f) => fs.statSync(path.join(weekendsDir, f)).isDirectory())
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  
  console.log(`\n=== Saison ${season} ===`);
  
  for (let i = 0; i < weekendFolders.length; i++) {
    const folder = weekendFolders[i];
    const round = i + 1;
    const weekendPath = path.join(weekendsDir, folder);
    loadWeekendFolder(weekendPath, folder, season, round);
  }
}

// Chargement des données de base
runSQLFile(path.join(__dirname, "seeds/constructors.sql"));
runSQLFile(path.join(__dirname, "seeds/drivers.sql"));
runSQLFile(path.join(__dirname, "seeds/2025/driver_seasons.sql"));
runSQLFile(path.join(__dirname, "seeds/2026/driver_seasons.sql"));

// Chargement des weekends
loadSeasonWeekends(2025);
loadSeasonWeekends(2026);

// Création de la ligue FSF
try {
  const existingLeague = db.prepare("SELECT id FROM leagues WHERE code = 'FSF'").get();
  
  if (!existingLeague) {
    let systemUser = db.prepare("SELECT id FROM users WHERE id = 1").get();
    
    if (!systemUser) {
      const bcrypt = require("bcrypt");
      const hashedPassword = bcrypt.hashSync("system_password_secure_123", 10);
      const res = db.prepare(`
        INSERT INTO users (username, email, password_hash)
        VALUES ('FSF_System', NULL, ?)
      `).run(hashedPassword);
      systemUser = { id: res.lastInsertRowid };
    }
    
    const result = db.prepare(`
      INSERT INTO leagues (name, code, creator_id, is_official)
      VALUES ('FSF Officiel', 'FSF', ?, 1)
    `).run(systemUser.id);
    
    console.log("✓ Ligue FSF Officiel créée (id:", result.lastInsertRowid, ")");
  } else {
    console.log("\n✓ Ligue FSF Officiel déjà existante");
  }
} catch (err) {
  console.error("✗ Erreur création ligue FSF :", err.message);
}

console.log("\nTous les seeds chargés !");