-- ============================================
-- SCHEMA COMPLET - FEEDER SERIES FANTASY
-- ============================================

-- ========= USERS =========
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  google_id TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ========= LEAGUES =========
CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,           -- Code invitation (ex: ABC123)
  creator_id INTEGER NOT NULL,
  is_official INTEGER DEFAULT 0,       -- 1 = ligue officielle FSF
  is_closed INTEGER DEFAULT 0,         -- 1 = fermée (plus d'inscription)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- ========= LEAGUE MEMBERS =========
CREATE TABLE IF NOT EXISTS league_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(league_id, user_id)
);

-- ========= LEAGUE SCORES =========
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

-- ========= FANTASY TEAMS =========
CREATE TABLE IF NOT EXISTS fantasy_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_validated INTEGER DEFAULT 0,      -- 0 = brouillon, 1 = validée
  validated_at TEXT,                   -- Timestamp de validation
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (league_id) REFERENCES leagues(id),
  UNIQUE(user_id, league_id, season)
);

-- ========= FANTASY CONSTRUCTORS =========
CREATE TABLE IF NOT EXISTS fantasy_constructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fantasy_team_id INTEGER NOT NULL,
  constructor_id INTEGER NOT NULL,
  FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id),
  FOREIGN KEY (constructor_id) REFERENCES constructors(id),
  UNIQUE(fantasy_team_id, constructor_id)
);

-- ========= FANTASY PICKS =========
CREATE TABLE IF NOT EXISTS fantasy_picks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fantasy_team_id INTEGER NOT NULL,
  driver_season_id INTEGER NOT NULL,
  FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id),
  FOREIGN KEY (driver_season_id) REFERENCES driver_seasons(id),
  UNIQUE(fantasy_team_id, driver_season_id)
);

-- ========= DRIVERS =========
CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  nationality TEXT
);

-- ========= CONSTRUCTORS =========
CREATE TABLE IF NOT EXISTS constructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  nationality TEXT,
  price REAL NOT NULL
);

-- ========= DRIVER SEASONS =========
CREATE TABLE IF NOT EXISTS driver_seasons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  constructor_id INTEGER NOT NULL,
  rookie INTEGER DEFAULT 0,
  price REAL NOT NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (constructor_id) REFERENCES constructors(id)
);

-- ========= RACE WEEKENDS =========
CREATE TABLE IF NOT EXISTS race_weekends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season INTEGER NOT NULL,
  round INTEGER NOT NULL,
  name TEXT NOT NULL,
  lock_deadline TEXT,                   -- ISO 8601: "2026-03-01T14:00:00Z"
  unlock_at TEXT
);

-- ========= RACE ENTRIES =========
CREATE TABLE IF NOT EXISTS race_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  race_weekend_id INTEGER NOT NULL,
  driver_season_id INTEGER NOT NULL,
  constructor_id INTEGER NOT NULL,
  car_number INTEGER NOT NULL,
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id),
  FOREIGN KEY (driver_season_id) REFERENCES driver_seasons(id),
  FOREIGN KEY (constructor_id) REFERENCES constructors(id)
);

-- ========= QUALIFYING RESULTS =========
CREATE TABLE IF NOT EXISTS qualifying_results (
  race_entry_id INTEGER,
  position INTEGER,
  status TEXT,
  FOREIGN KEY (race_entry_id) REFERENCES race_entries(id)
);

-- ========= SPRINT RESULTS =========
CREATE TABLE IF NOT EXISTS sprint_results (
  race_entry_id INTEGER,
  start_position INTEGER,
  finish_position INTEGER,
  status TEXT,
  fastest_lap INTEGER DEFAULT 0,
  FOREIGN KEY (race_entry_id) REFERENCES race_entries(id)
);

-- ========= FEATURE RESULTS =========
CREATE TABLE IF NOT EXISTS feature_results (
  race_entry_id INTEGER,
  start_position INTEGER,
  finish_position INTEGER,
  status TEXT,
  fastest_lap INTEGER DEFAULT 0,
  FOREIGN KEY (race_entry_id) REFERENCES race_entries(id)
);