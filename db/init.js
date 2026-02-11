const db = require("../db");

/* ========= USERS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  google_id TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

/* ========= LEAGUES ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  creator_id INTEGER NOT NULL,
  is_official INTEGER DEFAULT 0,
  is_closed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);
`);

/* ========= LEAGUE MEMBERS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS league_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(league_id, user_id)
);
`);

/* ========= LEAGUE SCORES ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS league_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  total_points INTEGER DEFAULT 0,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(league_id, user_id)
);
`);

/* ========= FANTASY TEAMS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS fantasy_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_validated INTEGER DEFAULT 0,
  validated_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  budget REAL DEFAULT 100.0,
  initial_spent REAL DEFAULT 0.0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (league_id) REFERENCES leagues(id),
  UNIQUE(user_id, league_id, season)
);
`);

/* ========= FANTASY CONSTRUCTORS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS fantasy_constructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fantasy_team_id INTEGER NOT NULL,
  constructor_id INTEGER NOT NULL,
  FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id),
  FOREIGN KEY (constructor_id) REFERENCES constructors(id),
  UNIQUE(fantasy_team_id, constructor_id)
);
`);

/* ========= FANTASY PICKS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS fantasy_picks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fantasy_team_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  UNIQUE(fantasy_team_id, driver_id, season)
);
`);

/* ========= DRIVERS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  nationality TEXT
);
`);

/* ========= CONSTRUCTORS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS constructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  nationality TEXT,
  price REAL NOT NULL
);
`);

/* ========= HISTORIQUE PRIX ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  race_weekend_id INTEGER NOT NULL,
  price_before REAL NOT NULL,
  price_after REAL NOT NULL,
  delta_brute REAL NOT NULL,
  s_perf REAL NOT NULL,
  attente REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id),
  UNIQUE(driver_id, race_weekend_id)
);
`);

/* ========= DRIVER SEASONS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS driver_seasons (
  driver_id INTEGER,
  season INTEGER,
  constructor_id INTEGER NOT NULL,
  rookie INTEGER DEFAULT 0,
  price REAL NOT NULL,
  last_delta REAL DEFAULT 0,
  PRIMARY KEY (driver_id, season),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (constructor_id) REFERENCES constructors(id)
);
`);

/* ========= RACE WEEKENDS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS race_weekends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season INTEGER NOT NULL,
  round INTEGER NOT NULL,
  name TEXT NOT NULL,
  lock_deadline TEXT,
  unlock_at TEXT,
  prices_updated INTEGER DEFAULT 0, 
  UNIQUE(season, round)
);
`);

/* ========= WEEKEND PARTICIPANTS ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS weekend_participants (
  driver_id INTEGER,
  race_weekend_id INTEGER,
  car_number INTEGER NOT NULL,
  constructor_id INTEGER NOT NULL,
  PRIMARY KEY (driver_id, race_weekend_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id),
  FOREIGN KEY (constructor_id) REFERENCES constructors(id)
);
`);

/* ========= QUALIFYING ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS qualifying_results (
  driver_id INTEGER,
  race_weekend_id INTEGER,
  position INTEGER,
  status TEXT DEFAULT 'OK',
  PRIMARY KEY (driver_id, race_weekend_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id)
);
`);

/* ========= SPRINT RACE ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS sprint_results (
  driver_id INTEGER,
  race_weekend_id INTEGER,
  start_position INTEGER,
  finish_position INTEGER,
  status TEXT DEFAULT 'OK',
  fastest_lap INTEGER DEFAULT 0,
  PRIMARY KEY (driver_id, race_weekend_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id)
);
`);

/* ========= FEATURE RACE ========= */
db.exec(`
CREATE TABLE IF NOT EXISTS feature_results (
  driver_id INTEGER,
  race_weekend_id INTEGER,
  start_position INTEGER,
  finish_position INTEGER,
  status TEXT DEFAULT 'OK',
  fastest_lap INTEGER DEFAULT 0,
  PRIMARY KEY (driver_id, race_weekend_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id)
);
`);

console.log("Database schema initialized");