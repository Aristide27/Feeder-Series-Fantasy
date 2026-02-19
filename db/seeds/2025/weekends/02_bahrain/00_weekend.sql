INSERT INTO race_weekends (season, round, name)
VALUES (2025, 2, 'Bahrain Grand Prix')
ON CONFLICT (season, round) DO NOTHING;
