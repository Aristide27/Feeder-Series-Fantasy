INSERT INTO sprint_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(27, 13, 10, 1, 'OK', 1),   -- Richard Verschoor (fastest lap)
(2, 13, 9, 2, 'OK', 0),   -- Joshua Dürksen
(20, 13, 8, 3, 'OK', 0),   -- Rafael Villagómez
(11, 13, 6, 4, 'OK', 0),   -- Sebastián Montoya
(14, 13, 5, 5, 'OK', 0),   -- Alexander Dunne
(23, 13, 2, 6, 'OK', 0),   -- Leonardo Fornaroli
(13, 13, 12, 7, 'OK', 0),   -- Martinius Stenshorne
(29, 13, 15, 8, 'OK', 0),   -- Jak Crawford
(7, 13, 11, 9, 'OK', 0),   -- Dino Beganovic
(6, 13, 7, 10, 'OK', 0),   -- Nikola Tsolov
(30, 13, 3, 11, 'OK', 0),   -- Victor Martins
(9, 13, 14, 12, 'OK', 0),   -- Gabriele Minì
(24, 13, 4, 13, 'OK', 0),   -- Roman Staněk
(10, 13, 1, 14, 'OK', 0),   -- Oliver Goethe
(22, 13, 13, 15, 'OK', 0),   -- John Bennett
(3, 13, 16, 16, 'OK', 0),   -- Ritomo Miyata
(28, 13, 18, 17, 'OK', 0),   -- Luke Browning
(26, 13, 17, 18, 'OK', 0),   -- Arvid Lindblad
(21, 13, 22, 19, 'OK', 0),   -- Laurens van Hoepen
(18, 13, 19, NULL, 'DNF', 0),   -- Cian Shields
(15, 13, 20, NULL, 'DNF', 0),   -- Kush Maini
(34, 13, 21, NULL, 'DNF', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
