INSERT INTO race_weekends (season, round, name, lock_deadline, unlock_at)
VALUES (2026, 4, 'Grand Prix de Monaco', '2026-06-05T14:00:00Z', '2026-06-07T23:59:00Z')
ON CONFLICT (season, round) DO NOTHING;
