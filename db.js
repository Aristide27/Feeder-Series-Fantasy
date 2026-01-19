const Database = require("better-sqlite3");

// Ouvre (ou crée) la base de données
const db = new Database("database.sqlite");

module.exports = db;

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
  ALTER TABLE drivers
  ADD COLUMN constructor_id INTEGER
`).run();

const insertDriver = db.prepare(`
  INSERT INTO drivers (name, number)
  VALUES (?, ?)
`);

const drivers = [
  { name: "Victor Martins", number: 1 },
  { name: "Théo Pourchaire", number: 5 },
  { name: "Jack Doohan", number: 2 },
];

const constructors = [
  { name: "ART Grand Prix", code: "ART" },
  { name: "MP Motorsport", code: "MP" },
  { name: "Virtuosi Racing", code: "VIR" }
];

drivers.forEach((driver) => {
  insertDriver.run(driver.name, driver.number);
});

const insertConstructor = db.prepare(`
  INSERT INTO constructors (name, code)
  VALUES (?, ?)
`);

constructors.forEach((c) => {
  insertConstructor.run(c.name, c.code);
});

db.prepare(`
  UPDATE drivers SET constructor_id = 1 WHERE name = 'Victor Martins'
`).run();

db.prepare(`
  UPDATE drivers SET constructor_id = 2 WHERE name = 'Théo Pourchaire'
`).run();
