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
    { name: "Victor Martins", number: 1 },
    { name: "Théo Pourchaire", number: 5 },
    { name: "Jack Doohan", number: 2 },
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
    { name: "ART Grand Prix", code: "ART" },
    { name: "MP Motorsport", code: "MP" },
    { name: "Virtuosi Racing", code: "VIR" }
  ];
  constructors.forEach(c => insertConstructor.run(c.name, c.code));
}

// --- Lier pilotes ↔ écuries (UPDATE ne crée jamais de doublons) ---
db.prepare(`UPDATE drivers SET constructor_id = 1 WHERE name = 'Victor Martins'`).run();
db.prepare(`UPDATE drivers SET constructor_id = 2 WHERE name = 'Théo Pourchaire'`).run();
