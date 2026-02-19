INSERT INTO race_weekends (season, round, name, lock_deadline, unlock_at)
VALUES (2026, 7, 'British Grand Prix', '2026-07-03T14:00:00Z', '2026-07-05T23:59:00Z')
ON CONFLICT (season, round) DO NOTHING;
