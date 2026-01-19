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

const insertDriver = db.prepare(`
  INSERT INTO drivers (name, number)
  VALUES (?, ?)
`);

const drivers = [
  { name: "Victor Martins", number: 1 },
  { name: "Théo Pourchaire", number: 5 },
  { name: "Jack Doohan", number: 2 },
];

drivers.forEach((driver) => {
  insertDriver.run(driver.name, driver.number);
});
