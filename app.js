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

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
