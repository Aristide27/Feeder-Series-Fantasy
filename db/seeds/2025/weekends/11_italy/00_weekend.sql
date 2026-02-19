INSERT INTO race_weekends (season, round, name)
VALUES (2025, 11, 'Gran premio d''Italia')
ON CONFLICT (season, round) DO NOTHING;
