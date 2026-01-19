const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

// Fichiers statiques
app.use(express.static(path.join(__dirname, "public")));

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

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/api/constructors", (req, res) => {
  const constructors = db
    .prepare("SELECT * FROM constructors")
    .all();
  res.json(constructors);
});
