const express = require("express");

// Crée une application Express
const app = express();

// Port sur lequel le serveur écoute
const PORT = 3000;

// Route de test
app.get("/", (req, res) => {
  res.send("Fantasy F2 server is running");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
