require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function init() {
  const client = await pool.connect();
  
  try {
    await client.query(`

      /* ========= USERS ========= */
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT,
        google_id TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      /* ========= LEAGUES ========= */
      CREATE TABLE IF NOT EXISTS leagues (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        creator_id INTEGER NOT NULL,
        is_official INTEGER DEFAULT 0,
        is_closed INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id)
      );

      /* ========= LEAGUE MEMBERS ========= */
      CREATE TABLE IF NOT EXISTS league_members (
        id SERIAL PRIMARY KEY,
        league_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(league_id, user_id)
      );

      /* ========= LEAGUE SCORES ========= */
      CREATE TABLE IF NOT EXISTS league_scores (
        id SERIAL PRIMARY KEY,
        league_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        total_points INTEGER DEFAULT 0,
        last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(league_id, user_id)
      );
      /* ========= DRIVERS ========= */
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        nationality TEXT
      );

      /* ========= CONSTRUCTORS ========= */
      CREATE TABLE IF NOT EXISTS constructors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        nationality TEXT,
        price REAL NOT NULL
      );

      /* ========= FANTASY TEAMS ========= */
      CREATE TABLE IF NOT EXISTS fantasy_teams (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        league_id INTEGER NOT NULL,
        season INTEGER NOT NULL,
        name TEXT,
        is_validated INTEGER DEFAULT 0,
        validated_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        budget REAL DEFAULT 100.0,
        initial_spent REAL DEFAULT 0.0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
        UNIQUE(user_id, league_id, season)
      );

      /* ========= FANTASY CONSTRUCTORS ========= */
      CREATE TABLE IF NOT EXISTS fantasy_constructors (
        id SERIAL PRIMARY KEY,
        fantasy_team_id INTEGER NOT NULL,
        constructor_id INTEGER NOT NULL,
        FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id) ON DELETE CASCADE,
        FOREIGN KEY (constructor_id) REFERENCES constructors(id),
        UNIQUE(fantasy_team_id, constructor_id)
      );

      /* ========= FANTASY PICKS ========= */
      CREATE TABLE IF NOT EXISTS fantasy_picks (
        id SERIAL PRIMARY KEY,
        fantasy_team_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        season INTEGER NOT NULL,
        is_captain INTEGER DEFAULT 0,
        FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers(id),
        UNIQUE(fantasy_team_id, driver_id, season)
      );

      /* ========= RACE WEEKENDS ========= */
      CREATE TABLE IF NOT EXISTS race_weekends (
        id SERIAL PRIMARY KEY,
        season INTEGER NOT NULL,
        round INTEGER NOT NULL,
        name TEXT NOT NULL,
        lock_deadline TIMESTAMPTZ,
        unlock_at TIMESTAMPTZ,
        prices_updated INTEGER DEFAULT 0,
        UNIQUE(season, round)
      );

      /* ========= DRIVER SEASONS ========= */
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

      /* ========= PRICE HISTORY ========= */
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        driver_id INTEGER NOT NULL,
        season INTEGER NOT NULL,
        race_weekend_id INTEGER NOT NULL,
        price_before REAL NOT NULL,
        price_after REAL NOT NULL,
        delta_brute REAL NOT NULL,
        s_perf REAL NOT NULL,
        attente REAL NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES drivers(id),
        FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id),
        UNIQUE(driver_id, race_weekend_id)
      );

      /* ========= WEEKEND PARTICIPANTS ========= */
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

      /* ========= QUALIFYING ========= */
      CREATE TABLE IF NOT EXISTS qualifying_results (
        driver_id INTEGER,
        race_weekend_id INTEGER,
        position INTEGER,
        status TEXT DEFAULT 'OK',
        PRIMARY KEY (driver_id, race_weekend_id),
        FOREIGN KEY (driver_id) REFERENCES drivers(id),
        FOREIGN KEY (race_weekend_id) REFERENCES race_weekends(id)
      );

      /* ========= SPRINT RACE ========= */
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

      /* ========= FEATURE RACE ========= */
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
  } catch (err) {
    console.error("Error initializing schema:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

init();