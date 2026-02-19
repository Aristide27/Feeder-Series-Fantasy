INSERT INTO race_weekends (season, round, name)
VALUES (2025, 10, 'Hungarian Grand Prix')
ON CONFLICT (season, round) DO NOTHING;
