INSERT INTO race_weekends (season, round, name, lock_deadline, unlock_at)
VALUES (2026, 10, 'Gran premio d''Italia', '2026-09-04T14:00:00Z', '2026-09-06T23:59:00Z')
ON CONFLICT (season, round) DO NOTHING;
