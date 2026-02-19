INSERT INTO race_weekends (season, round, name)
VALUES (2025, 14, 'Abu Dhabi Grand Prix')
ON CONFLICT (season, round) DO NOTHING;
