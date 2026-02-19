INSERT INTO race_weekends (season, round, name, lock_deadline, unlock_at)
VALUES (2026, 12, 'Azerbaijan Grand Prix', '2026-09-25T14:00:00Z', '2026-09-27T23:59:00Z')
ON CONFLICT (season, round) DO NOTHING;
