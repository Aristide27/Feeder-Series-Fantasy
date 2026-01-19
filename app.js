const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json()); // pour lire JSON POST
app.use(express.static(path.join(__dirname, "public"))); // fichiers statiques

// Routes API
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/api/users", (req, res) => {
  const { username, email } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO users (username, email)
      VALUES (?, ?)
    `);
    const info = stmt.run(username, email);

    res.json({ id: info.lastInsertRowid, username, email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/picks", (req, res) => {
  const { user_id, driver1_id, driver2_id, constructor_id } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO picks (user_id, driver1_id, driver2_id, constructor_id)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(user_id, driver1_id, driver2_id, constructor_id);

    res.json({ id: info.lastInsertRowid, user_id, driver1_id, driver2_id, constructor_id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/drivers", (req, res) => {
  const drivers = db.prepare(`
    SELECT drivers.id,
           drivers.name,
           drivers.number,
           constructors.name AS constructor
    FROM drivers
    LEFT JOIN constructors
      ON drivers.constructor_id = constructors.id
  `).all();
  res.json(drivers);
});

app.get("/api/constructors", (req, res) => {
  const constructors = db.prepare("SELECT * FROM constructors").all();
  res.json(constructors);
});

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});

app.get("/api/picks/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const picks = db.prepare(`
    SELECT picks.id, 
           drivers1.name AS driver1, 
           drivers2.name AS driver2, 
           constructors.name AS constructor
    FROM picks
    JOIN drivers AS drivers1 ON picks.driver1_id = drivers1.id
    JOIN drivers AS drivers2 ON picks.driver2_id = drivers2.id
    JOIN constructors ON picks.constructor_id = constructors.id
    WHERE picks.user_id = ?
  `).all(user_id);

  res.json(picks);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const { calculateQualifyingDriverPoints } = require("./logic/points");

console.log("Q P1:", calculateQualifyingDriverPoints({ position: 1, status: "classified" }));
console.log("Q P10:", calculateQualifyingDriverPoints({ position: 10, status: "classified" }));
console.log("Q P15:", calculateQualifyingDriverPoints({ position: 15, status: "classified" }));
console.log("Q NC:", calculateQualifyingDriverPoints({ position: null, status: "NC" }));
console.log("Q DSQ:", calculateQualifyingDriverPoints({ position: null, status: "DSQ" }));
