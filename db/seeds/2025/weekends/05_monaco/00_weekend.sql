INSERT INTO race_weekends (season, round, name)
VALUES (2025, 5, 'Grand Prix de Monaco')
ON CONFLICT (season, round) DO NOTHING;
