INSERT INTO race_weekends (season, round, name, lock_deadline, unlock_at)
-- VALUES (2026, 1, 'Australian Grand Prix', '2026-03-06T14:00:00Z', '2026-03-08T23:59:00Z')
VALUES (2026, 1, 'Australian Grand Prix', '2026-03-01T17:10:00Z', '2026-03-01T17:12:00Z')
ON CONFLICT (season, round) DO NOTHING;
