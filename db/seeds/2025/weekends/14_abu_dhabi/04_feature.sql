INSERT OR IGNORE INTO feature_results
(race_entry_id, start_position, finish_position, status, fastest_lap)
VALUES
(2, 8, 1, 'OK', 0),          -- Joshua Dürksen
(24, 1, 2, 'OK', 0),         -- Roman Staněk
(9, 13, 3, 'OK', 0),         -- Gabriele Minì
(7, 4, 4, 'OK', 0),          -- Dino Beganovic
(10, 6, 5, 'OK', 0),         -- Oliver Goethe
(35, 16, 6, 'OK', 0),        -- Rafael Villagómez
(15, 20, 7, 'OK', 0),        -- Kush Maini
(3, 14, 8, 'OK', 0),         -- Ritomo Miyata
(26, 10, 9, 'OK', 1),        -- Arvid Lindblad (fastest lap)
(29, 2, 10, 'OK', 0),        -- Jak Crawford
(23, 3, 11, 'OK', 0),        -- Leonardo Fornaroli
(6, 9, 12, 'OK', 0),         -- Nikola Tsolov
(27, 12, 13, 'OK', 0),       -- Richard Verschoor
(28, 17, 14, 'OK', 0),       -- Luke Browning
(13, 18, 15, 'OK', 0),       -- Martinius Stenshorne
(22, 15, 16, 'OK', 0),       -- John Bennett
(16, 22, 17, 'OK', 0),       -- Tasanapol Inthraphuvasak
(11, 5, NULL, 'DNF', 0),     -- Sebastián Montoya
(30, 7, NULL, 'DNF', 0),     -- Victor Martins
(18, 21, NULL, 'DNF', 0),    -- Cian Shields
(14, 11, NULL, 'DNF', 0),    -- Alexander Dunne
(21, NULL, NULL, 'DNS', 0);  -- Laurens van Hoepen
