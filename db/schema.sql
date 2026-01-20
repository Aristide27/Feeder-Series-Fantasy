-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS picks;
DROP TABLE IF EXISTS fantasy_teams;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS constructors;

CREATE TABLE constructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  rookie INTEGER DEFAULT 0,
  constructor_id INTEGER,
  FOREIGN KEY (constructor_id) REFERENCES constructors(id),
  UNIQUE (name, number)
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE
);

CREATE TABLE fantasy_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  constructor_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (constructor_id) REFERENCES constructors(id)
);

CREATE TABLE picks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fantasy_team_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  UNIQUE (fantasy_team_id, driver_id)
);

CREATE TABLE race_weekends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  season INTEGER NOT NULL,
  round INTEGER NOT NULL,
  UNIQUE (season, round)
);

CREATE TABLE qualifying_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  race_weekend_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  position INTEGER,
  status TEXT NOT NULL, -- OK, NC, DSQ
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  UNIQUE (race_weekend_id, driver_id)
);

CREATE TABLE sprint_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  race_weekend_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  start_position INTEGER,
  finish_position INTEGER,
  status TEXT NOT NULL, -- OK, DNF, DSQ
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  UNIQUE (race_weekend_id, driver_id)
);

CREATE TABLE race_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  race_weekend_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  start_position INTEGER,
  finish_position INTEGER,
  status TEXT NOT NULL, -- OK, DNF, DSQ
  driver_of_the_day INTEGER DEFAULT 0,
  FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  UNIQUE (race_weekend_id, driver_id)
);
