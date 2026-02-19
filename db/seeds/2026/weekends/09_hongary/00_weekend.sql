INSERT INTO race_weekends (season, round, name, lock_deadline, unlock_at)
VALUES (2026, 9, 'Hungarian Grand Prix', '2026-07-24T14:00:00Z', '2026-07-26T23:59:00Z')
ON CONFLICT (season, round) DO NOTHING;
