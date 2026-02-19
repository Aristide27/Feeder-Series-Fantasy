INSERT INTO race_weekends (season, round, name)
VALUES (2025, 3, 'Saudi Arabian Grand Prix')
ON CONFLICT (season, round) DO NOTHING;
