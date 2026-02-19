INSERT INTO race_weekends (season, round, name)
VALUES (2025, 9, 'Belgian Grand Prix')
ON CONFLICT (season, round) DO NOTHING;
