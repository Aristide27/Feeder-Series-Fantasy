const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Route de test API
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
