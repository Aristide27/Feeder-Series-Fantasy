INSERT INTO race_weekends (season, round, name)
VALUES (2025, 6, 'Gran premio de España')
ON CONFLICT (season, round) DO NOTHING;
