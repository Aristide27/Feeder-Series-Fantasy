INSERT INTO race_weekends (season, round, name, lock_deadline, unlock_at)
VALUES (2026, 8, 'Belgian Grand Prix', '2026-07-17T14:00:00Z', '2026-07-19T00:00:00Z')
ON CONFLICT (season, round) DO NOTHING;
