INSERT INTO race_weekends (season, round, name, lock_deadline, unlock_at)
VALUES (2026, 3, 'Saudi Arabian Grand Prix', '2026-04-17T14:00:00Z', '2026-04-19T23:59:00Z')
ON CONFLICT (season, round) DO NOTHING;
