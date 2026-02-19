require("dotenv").config();
const pool = require("../db");
const fs = require("fs");
const path = require("path");

async function runSQL(client, sql) {
  try {
    await client.query(sql);
  } catch (err) {
    console.error("✗ Erreur SQL :", err.message);
    console.error("SQL:", sql.substring(0, 200));
  }
}

function replaceWeekendId(sql, newWeekendId) {
  // Remplace le 2ème paramètre dans chaque ligne VALUES (driver_id, OLD_ID, ...)
  return sql.replace(
    /(\(\s*\d+\s*,\s*)(\d+)(\s*,)/g,
    (match, before, oldId, after) => {
      const id = parseInt(oldId);
      if (id >= 1 && id <= 999) {
        return `${before}${newWeekendId}${after}`;
      }
      return match;
    }
  );
}

async function loadWeekendFolder(client, weekendPath, folderName, season, round) {
  console.log(`  ↳ Chargement du weekend : ${folderName}`);

  // 1. Insérer le weekend
  const weekendFile = path.join(weekendPath, "00_weekend.sql");
  if (!fs.existsSync(weekendFile)) {
    console.log("  ⚠️  00_weekend.sql non trouvé");
    return;
  }

  let weekendSQL = fs.readFileSync(weekendFile, "utf-8");
  await runSQL(client, weekendSQL);

  // 2. Récupérer l'ID généré
  const result = await client.query(
    "SELECT id FROM race_weekends WHERE season = $1 AND round = $2",
    [season, round]
  );

  if (!result.rows[0]) {
    console.error(`  ✗ Weekend ${season} R${round} non trouvé`);
    return;
  }

  const weekendId = result.rows[0].id;

  // 3. Charger les autres fichiers en remplaçant l'ID hardcodé
  const otherFiles = [
    "01_participants.sql",
    "01_entries.sql",
    "02_qualifying.sql",
    "03_sprint.sql",
    "04_feature.sql",
  ];

  for (const fileName of otherFiles) {
    const filePath = path.join(weekendPath, fileName);
    if (!fs.existsSync(filePath)) continue;

    let sql = fs.readFileSync(filePath, "utf-8");
    sql = replaceWeekendId(sql, weekendId);
    await runSQL(client, sql);
  }
}

async function loadSeasonWeekends(client, season) {
  const weekendsDir = path.join(__dirname, `seeds/${season}/weekends`);

  if (!fs.existsSync(weekendsDir)) {
    console.log(`⚠️  Pas de dossier weekends pour ${season}`);
    return;
  }

  const weekendFolders = fs
    .readdirSync(weekendsDir)
    .filter((f) => fs.statSync(path.join(weekendsDir, f)).isDirectory())
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  console.log(`\n=== Saison ${season} (${weekendFolders.length} weekends) ===`);

  for (let i = 0; i < weekendFolders.length; i++) {
    const folder = weekendFolders[i];
    const round = i + 1;
    const weekendPath = path.join(weekendsDir, folder);
    await loadWeekendFolder(client, weekendPath, folder, season, round);
  }
}

async function seed() {
  const client = await pool.connect();

  try {
    console.log("=== Chargement des données de base ===");

    // Constructors
    console.log("↳ Constructors...");
    let sql = fs.readFileSync(path.join(__dirname, "seeds/constructors.sql"), "utf-8");
    await runSQL(client, sql);

    // Drivers
    console.log("↳ Drivers...");
    sql = fs.readFileSync(path.join(__dirname, "seeds/drivers.sql"), "utf-8");
    await runSQL(client, sql);

    // Driver seasons 2025
    const ds2025 = path.join(__dirname, "seeds/2025/driver_seasons.sql");
    if (fs.existsSync(ds2025)) {
      console.log("↳ Driver seasons 2025...");
      sql = fs.readFileSync(ds2025, "utf-8");
      await runSQL(client, sql);
    }

    // Driver seasons 2026
    console.log("↳ Driver seasons 2026...");
    sql = fs.readFileSync(path.join(__dirname, "seeds/2026/driver_seasons.sql"), "utf-8");
    await runSQL(client, sql);

    // Weekends
    await loadSeasonWeekends(client, 2025);
    await loadSeasonWeekends(client, 2026);

    // Ligue FSF Officiel
    console.log("\n=== Création ligue FSF ===");
    const existingLeague = await client.query(
      "SELECT id FROM leagues WHERE code = 'FSF'"
    );

    if (existingLeague.rows.length === 0) {
      let systemUser = await client.query(
        "SELECT id FROM users WHERE username = 'FSF_System'"
      );

      if (systemUser.rows.length === 0) {
        const bcrypt = require("bcrypt");
        const hashedPassword = bcrypt.hashSync("system_password_secure_123", 10);
        const res = await client.query(
          `INSERT INTO users (username, email, password_hash) 
           VALUES ('FSF_System', NULL, $1) RETURNING id`,
          [hashedPassword]
        );
        systemUser = { rows: [{ id: res.rows[0].id }] };
      }

      const result = await client.query(
        `INSERT INTO leagues (name, code, creator_id, is_official)
         VALUES ('FSF Officiel', 'FSF', $1, 1) RETURNING id`,
        [systemUser.rows[0].id]
      );
      console.log("✓ Ligue FSF Officiel créée (id:", result.rows[0].id, ")");
    } else {
      console.log("✓ Ligue FSF Officiel déjà existante");
    }

    console.log("\nTous les seeds chargés !");
  } catch (err) {
    console.error("Erreur seed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();