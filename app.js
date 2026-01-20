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

app.post("/api/fantasy-teams", (req, res) => {
  const { user_id, constructor_id } = req.body;

  // Vérifier constructeur
  const constructor = db
    .prepare("SELECT id FROM constructors WHERE id = ?")
    .get(constructor_id);

  if (!constructor) {
    return res.status(400).json({ error: "Constructor does not exist" });
  }

  // Vérifier que l'utilisateur n'a pas déjà une équipe
  const existing = db
    .prepare("SELECT id FROM fantasy_teams WHERE user_id = ?")
    .get(user_id);

  if (existing) {
    return res.status(400).json({ error: "User already has a fantasy team" });
  }

  const result = db.prepare(`
    INSERT INTO fantasy_teams (user_id, constructor_id)
    VALUES (?, ?)
  `).run(user_id, constructor_id);

  res.json({ fantasy_team_id: result.lastInsertRowid });
});

app.post("/api/fantasy-teams/:teamId/picks", (req, res) => {
  const { teamId } = req.params;
  const { driver_id } = req.body;

  // Vérifier pilote
  const driver = db
    .prepare("SELECT id FROM drivers WHERE id = ?")
    .get(driver_id);

  if (!driver) {
    return res.status(400).json({ error: "Driver does not exist" });
  }

  // Vérifier nombre de pilotes
  const picks = db.prepare(`
    SELECT COUNT(*) as count
    FROM fantasy_picks
    WHERE fantasy_team_id = ?
  `).get(teamId);

  if (picks.count >= 2) {
    return res.status(400).json({ error: "Maximum 2 drivers allowed" });
  }

  // Vérifier doublon
  const alreadyPicked = db.prepare(`
    SELECT id FROM fantasy_picks
    WHERE fantasy_team_id = ? AND driver_id = ?
  `).get(teamId, driver_id);

  if (alreadyPicked) {
    return res.status(400).json({ error: "Driver already picked" });
  }

  // Ajouter le pick
  db.prepare(`
    INSERT INTO fantasy_picks (fantasy_team_id, driver_id)
    VALUES (?, ?)
  `).run(teamId, driver_id);

  res.json({ success: true });
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

app.get("/api/fantasy-teams", (req, res) => {
  const teams = db.prepare(`
    SELECT * FROM fantasy_teams
  `).all();

  res.json(teams);
});

app.get("/api/fantasy-teams/:teamId", (req, res) => {
  const { teamId } = req.params;

  const team = db.prepare(`
    SELECT ft.id, c.name AS constructor
    FROM fantasy_teams ft
    JOIN constructors c ON ft.constructor_id = c.id
    WHERE ft.id = ?
  `).get(teamId);

  const drivers = db.prepare(`
    SELECT d.name, d.number
    FROM fantasy_picks fp
    JOIN drivers d ON fp.driver_id = d.id
    WHERE fp.fantasy_team_id = ?
  `).all(teamId);

  res.json({ team, drivers });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
