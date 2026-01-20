-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS picks;
DROP TABLE IF EXISTS fantasy_teams;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS constructors;

-- Écuries
CREATE TABLE constructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Pilotes
CREATE TABLE drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  constructor_id INTEGER,
  FOREIGN KEY (constructor_id) REFERENCES constructors(id)
);

-- Utilisateurs
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE
);

-- Équipes fantasy
CREATE TABLE fantasy_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  constructor_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (constructor_id) REFERENCES constructors(id)
);

-- Picks pilotes
CREATE TABLE picks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fantasy_team_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  UNIQUE (fantasy_team_id, driver_id)
);
