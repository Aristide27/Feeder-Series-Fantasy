INSERT INTO sprint_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(22, 7, 1,  12, 'OK', 0),  -- John Bennett
(25, 7, 2,  1,  'OK', 0),  -- Pepe Martí
(2,  7, 3,  2,  'OK', 0),  -- Joshua Dürksen
(14, 7, 4,  6,  'OK', 0),  -- Alexander Dunne
(24, 7, 5,  3,  'OK', 0),  -- Roman Staněk
(31, 7, 6,  NULL, 'DNF', 0), -- Amaury Cordeel
(9,  7, 7,  NULL, 'DNF', 0), -- Gabriele Minì
(27, 7, 8,  4,  'OK', 0),  -- Richard Verschoor
(30, 7, 9,  7,  'OK', 0),  -- Victor Martins
(23, 7, 10, NULL, 'DNF', 0), -- Leonardo Fornaroli
(11, 7, 11, 5,  'OK', 0),  -- Sebastián Montoya
(26, 7, 12, NULL, 'DNF', 0), -- Arvid Lindblad
(3,  7, 13, 8,  'OK', 0),  -- Ritomo Miyata
(32, 7, 14, NULL, 'DNF', 0), -- Sami Meguetounif
(29, 7, 15, NULL, 'DNS', 0), -- Jak Crawford
(10, 7, 16, 11, 'OK', 0),  -- Oliver Goethe
(28, 7, 17, NULL, 'DNF', 0), -- Luke Browning
(15, 7, 18, 17, 'OK', 1),  -- Kush Maini (best lap)
(33, 7, 19, 10, 'OK', 0),  -- Max Esterson
(20, 7, 20, 9,  'OK', 0),  -- Rafael Villagómez
(7,  7, 21, NULL, 'DNF', 0), -- Dino Beganovic
(18, 7, 22, 12, 'OK', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
