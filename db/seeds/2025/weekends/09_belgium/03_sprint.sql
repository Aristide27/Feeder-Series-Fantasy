INSERT OR IGNORE INTO sprint_results
(race_entry_id, start_position, finish_position, status, fastest_lap)
VALUES
(23, 7, 1, 'OK', 0),        -- Leonardo Fornaroli
(30, 4, 2, 'OK', 0),        -- Victor Martins
(9, 8, 3, 'OK', 0),         -- Gabriele Minì
(10, 10, 4, 'OK', 0),       -- Oliver Goethe
(25, 6, 5, 'OK', 0),        -- Pepe Martí
(24, 3, 6, 'OK', 0),        -- Roman Staněk
(14, 1, 7, 'OK', 0),        -- Alexander Dunne
(3, 2, 8, 'OK', 0),         -- Ritomo Miyata
(22, 15, 9, 'OK', 0),       -- John Bennett
(29, 14, 10, 'OK', 0),      -- Jak Crawford
(2, 21, 11, 'OK', 0),       -- Joshua Dürksen
(35, 18, 12, 'OK', 0),      -- Rafael Villagómez
(18, 22, 13, 'OK', 0),      -- Cian Shields
(33, 17, 14, 'OK', 0),      -- Max Esterson
(11, 16, 15, 'OK', 0),      -- Sebastián Montoya
(7, 13, 16, 'OK', 0),       -- Dino Beganovic
(26, 5, 17, 'OK', 1),       -- Arvid Lindblad (fastest lap)
(15, 20, 18, 'OK', 0),      -- Kush Maini (3 laps down)
(32, 19, NULL, 'DNF', 0),   -- Sami Meguetounif
(31, 9, NULL, 'DNF', 0),    -- Amaury Cordeel
(27, 11, NULL, 'DNF', 0),   -- Richard Verschoor
(28, 12, NULL, 'DNF', 0);   -- Luke Browning
