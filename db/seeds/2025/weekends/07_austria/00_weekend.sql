INSERT INTO race_weekends (season, round, name)
VALUES (2025, 7, 'Austrian Grand Prix')
ON CONFLICT (season, round) DO NOTHING;
