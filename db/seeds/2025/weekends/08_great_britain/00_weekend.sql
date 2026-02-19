INSERT INTO race_weekends (season, round, name)
VALUES (2025, 8, 'British Grand Prix')
ON CONFLICT (season, round) DO NOTHING;
