INSERT INTO sprint_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(25, 10, 11, 1, 'OK', 0),   -- Pepe Martí
(14, 10, 4, 2, 'OK', 0),   -- Alexander Dunne
(29, 10, 14, 3, 'OK', 0),   -- Jak Crawford
(30, 10, 2, 4, 'OK', 0),   -- Victor Martins
(23, 10, 1, 5, 'OK', 0),   -- Leonardo Fornaroli
(27, 10, 6, 6, 'OK', 0),   -- Richard Verschoor
(10, 10, 15, 7, 'OK', 0),   -- Oliver Goethe
(7, 10, 9, 8, 'OK', 0),   -- Dino Beganovic
(15, 10, 20, 9, 'OK', 0),   -- Kush Maini
(26, 10, 16, 10, 'OK', 0),   -- Arvid Lindblad
(2, 10, 10, 11, 'OK', 0),   -- Joshua Dürksen
(28, 10, 3, 12, 'OK', 0),   -- Luke Browning
(24, 10, 5, 13, 'OK', 0),   -- Roman Staněk
(9, 10, 12, 14, 'OK', 1),   -- Gabriele Minì (fastest lap)
(3, 10, 19, 15, 'OK', 0),   -- Ritomo Miyata
(31, 10, 21, 16, 'OK', 0),   -- Amaury Cordeel
(32, 10, 7, 17, 'OK', 0),   -- Sami Meguetounif
(20, 10, 8, 18, 'OK', 0),   -- Rafael Villagómez
(33, 10, 17, 19, 'OK', 0),   -- Max Esterson
(22, 10, 13, 20, 'OK', 0),   -- John Bennett
(18, 10, 22, 21, 'OK', 0),   -- Cian Shields
(11, 10, 18, NULL, 'DNF', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
