require("dotenv").config();

const express = require("express");
const path = require("path");
const db = require("./db");
const cors = require("cors");
const session = require("express-session");
const passport = require("./api/passport");

require("./db/init");

const scoringRouter = require("./logic/scoring-router");
const fantasyRouter = require("./api/fantasy");
const authRouter = require("./api/auth");
const userRouter = require("./api/users");
const leaguesRouter = require("./api/leagues");
const rankingsRouter = require("./api/rankings");
const contactRouter = require("./api/contact");
const teamsRouter = require("./api/teams");
const driverStatsRouter = require('./api/driver-stats');
const app = express();
const PORT = 3000;

app.use(cors({
  origin: [
    "http://localhost:3001",
    "https://feederseriesfantasy.com",
    "https://www.feederseriesfantasy.com"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: process.env.SESSION_SECRET || "fsf_fantasy_secret_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use('/api', scoringRouter);
app.use("/api/fantasy", fantasyRouter);
app.use("/api/leagues", leaguesRouter);
app.use("/api/rankings", rankingsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/teams", teamsRouter);
app.use('/api/driver-stats', driverStatsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/api/users", async (req, res) => {
  const { username, email } = req.body;

  try {
    const result = await db.query(`
      INSERT INTO users (username, email)
      VALUES ($1, $2)
      RETURNING id
    `, [username, email]);

    res.json({ id: result.rows[0].id, username, email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/fantasy-teams", async (req, res) => {
  const { user_id, constructor_id } = req.body;

  // Vérifier constructeur
  const constructorResult = await db.query(
    "SELECT id FROM constructors WHERE id = $1",
    [constructor_id]
  );
  const constructor = constructorResult.rows[0];

  if (!constructor) {
    return res.status(400).json({ error: "Constructor does not exist" });
  }

  // Vérifier que l'utilisateur n'a pas déjà une équipe
  const existingResult = await db.query(
    "SELECT id FROM fantasy_teams WHERE user_id = $1",
    [user_id]
  );
  const existing = existingResult.rows[0];

  if (existing) {
    return res.status(400).json({ error: "User already has a fantasy team" });
  }

  const result = await db.query(`
    INSERT INTO fantasy_teams (user_id, constructor_id)
    VALUES ($1, $2)
    RETURNING id
  `, [user_id, constructor_id]);

  res.json({ fantasy_team_id: result.rows[0].id });
});

app.post("/api/fantasy-teams/:teamId/picks", async (req, res) => {
  const { teamId } = req.params;
  const { driver_id } = req.body;

  // Vérifier pilote
  const driverResult = await db.query(
    "SELECT id FROM drivers WHERE id = $1",
    [driver_id]
  );
  const driver = driverResult.rows[0];

  if (!driver) {
    return res.status(400).json({ error: "Driver does not exist" });
  }

  // Vérifier nombre de pilotes
  const picksResult = await db.query(`
    SELECT COUNT(*) as count
    FROM fantasy_picks
    WHERE fantasy_team_id = $1
  `, [teamId]);
  const picks = picksResult.rows[0];

  if (picks.count >= 2) {
    return res.status(400).json({ error: "Maximum 2 drivers allowed" });
  }

  // Vérifier doublon
  const alreadyPickedResult = await db.query(`
    SELECT id FROM fantasy_picks
    WHERE fantasy_team_id = $1 AND driver_id = $2
  `, [teamId, driver_id]);
  const alreadyPicked = alreadyPickedResult.rows[0];

  if (alreadyPicked) {
    return res.status(400).json({ error: "Driver already picked" });
  }

  // Ajouter le pick
  await db.query(`
    INSERT INTO fantasy_picks (fantasy_team_id, driver_id)
    VALUES ($1, $2)
  `, [teamId, driver_id]);

  res.json({ success: true });
});

app.get("/api/drivers", async (req, res) => {
  const result = await db.query(`
    SELECT drivers.id,
           drivers.name,
           drivers.number,
           constructors.name AS constructor
    FROM drivers
    LEFT JOIN constructors
      ON drivers.constructor_id = constructors.id
  `);
  res.json(result.rows);
});

app.get("/api/constructors", async (req, res) => {
  const result = await db.query("SELECT * FROM constructors");
  res.json(result.rows);
});

app.get("/api/users", async (req, res) => {
  const result = await db.query("SELECT * FROM users");
  res.json(result.rows);
});

app.get("/api/fantasy-teams", async (req, res) => {
  const result = await db.query(`
    SELECT * FROM fantasy_teams
  `);
  res.json(result.rows);
});

app.get("/api/fantasy-teams/:teamId", async (req, res) => {
  const { teamId } = req.params;

  const teamResult = await db.query(`
    SELECT ft.id, c.name AS constructor
    FROM fantasy_teams ft
    JOIN constructors c ON ft.constructor_id = c.id
    WHERE ft.id = $1
  `, [teamId]);

  const driversResult = await db.query(`
    SELECT d.name, d.number
    FROM fantasy_picks fp
    JOIN drivers d ON fp.driver_id = d.id
    WHERE fp.fantasy_team_id = $1
  `, [teamId]);

  res.json({ team: teamResult.rows[0], drivers: driversResult.rows });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});