INSERT INTO race_weekends (season, round, name)
VALUES (2025, 1, 'Australian Grand Prix')
ON CONFLICT (season, round) DO NOTHING;