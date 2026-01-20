const Database = require("better-sqlite3");
const db = new Database("database.sqlite");
module.exports = db;

// --- Création des tables ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    number INTEGER NOT NULL,
    active INTEGER DEFAULT 1
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS constructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    active INTEGER DEFAULT 1
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    active INTEGER DEFAULT 1
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS fantasy_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    constructor_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(constructor_id) REFERENCES constructors(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS fantasy_picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fantasy_team_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    UNIQUE(fantasy_team_id, driver_id),
    FOREIGN KEY(fantasy_team_id) REFERENCES fantasy_teams(id),
    FOREIGN KEY(driver_id) REFERENCES drivers(id)
  )
`).run();

// --- Ajouter la colonne constructor_id seulement si elle n'existe pas ---
const pragma = db.prepare("PRAGMA table_info(drivers)").all();
const hasConstructorId = pragma.some(col => col.name === "constructor_id");

if (!hasConstructorId) {
  db.prepare(`
    ALTER TABLE drivers
    ADD COLUMN constructor_id INTEGER
  `).run();
}

// --- Seed pilotes (uniquement si vide) ---
const countDrivers = db.prepare("SELECT COUNT(*) AS count FROM drivers").get();
if (countDrivers.count === 0) {
  const insertDriver = db.prepare(`
    INSERT INTO drivers (name, number)
    VALUES (?, ?)
  `);
  const drivers = [
    { name: "Rafael Câmara", number: 1 },
    { name: "Joshua Dürksen", number: 2 },
    { name: "Ritomo Miyata", number: 3 },
    { name: "Colton Hertan", number: 4 },
    { name: "Noel León", number: 5 },
    { name: "Nikola Tsolov", number: 6 },
    { name: "Dino Beganovic", number: 7 },
    { name: "Roman Bilinski", number: 8 },
    { name: "Gabriele Minì", number: 9 },
    { name: "Oliver Goethe", number: 10 },
    { name: "Sebastián Montoya", number: 11 },
    { name: "Mari Boya", number: 12 },
    { name: "Martinius Stenshorne", number: 14 },
    { name: "Alexander Dunne", number: 15 },
    { name: "Kush Maini", number: 16 },
    { name: "Tasanapol Inthraphuvasak", number: 17 },
    { name: "Emerson Fittipaldi", number: 20 },
    { name: "Cian Shields", number: 21 },
    { name: "Nicolás Varrone", number: 22 },
    { name: "Driver 23", number: 23 },
    { name: "Laurens van Hoepen", number: 24 },
    { name: "John Bennett", number: 25 }
  ];
  drivers.forEach(driver => insertDriver.run(driver.name, driver.number));
}

// --- Seed constructeurs (uniquement si vide) ---
const countConstructors = db.prepare("SELECT COUNT(*) AS count FROM constructors").get();
if (countConstructors.count === 0) {
  const insertConstructor = db.prepare(`
    INSERT INTO constructors (name, code)
    VALUES (?, ?)
  `);
  const constructors = [
    { name: "Invicta Racing", code: "INV" },
    { name: "Hitech TGR", code: "HIT" },
    { name: "Campos Racing", code: "CAM" },
    { name: "DAMS Lucas Oil", code: "DAM" },
    { name: "MP Motorsport", code: "MPM" },
    { name: "PREMA Racing", code: "PRE" },
    { name: "Rodin Motorsport", code: "ROD" },
    { name: "ART Grand Prix", code: "ART" },
    { name: "AIX Racing", code: "AIX" },
    { name: "Van Amersfoort Racing", code: "VAR" },
    { name: "TRIDENT", code: "TRI" }
  ];
  constructors.forEach(c => insertConstructor.run(c.name, c.code));
}

// --- Lier pilotes ↔ écuries (UPDATE ne crée jamais de doublons) ---
db.prepare(`UPDATE drivers SET constructor_id = 1 WHERE name = 'Victor Martins'`).run();
db.prepare(`UPDATE drivers SET constructor_id = 2 WHERE name = 'Théo Pourchaire'`).run();
