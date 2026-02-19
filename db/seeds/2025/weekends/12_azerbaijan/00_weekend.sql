INSERT INTO race_weekends (season, round, name)
VALUES (2025, 12, 'Azerbaijan Grand Prix')
ON CONFLICT (season, round) DO NOTHING;
