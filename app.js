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
  const drivers = db.prepare("SELECT * FROM drivers").all();
  res.json(drivers);
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
