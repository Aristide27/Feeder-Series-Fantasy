INSERT INTO feature_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(2, 14, 8, 1, 'OK', 0),   -- Joshua Dürksen
(24, 14, 1, 2, 'OK', 0),   -- Roman Staněk
(9, 14, 13, 3, 'OK', 0),   -- Gabriele Minì
(7, 14, 4, 4, 'OK', 0),   -- Dino Beganovic
(10, 14, 6, 5, 'OK', 0),   -- Oliver Goethe
(20, 14, 16, 6, 'OK', 0),   -- Rafael Villagómez
(15, 14, 20, 7, 'OK', 0),   -- Kush Maini
(3, 14, 14, 8, 'OK', 0),   -- Ritomo Miyata
(26, 14, 10, 9, 'OK', 1),   -- Arvid Lindblad (fastest lap)
(29, 14, 2, 10, 'OK', 0),   -- Jak Crawford
(23, 14, 3, 11, 'OK', 0),   -- Leonardo Fornaroli
(6, 14, 9, 12, 'OK', 0),   -- Nikola Tsolov
(27, 14, 12, 13, 'OK', 0),   -- Richard Verschoor
(28, 14, 17, 14, 'OK', 0),   -- Luke Browning
(13, 14, 18, 15, 'OK', 0),   -- Martinius Stenshorne
(22, 14, 15, 16, 'OK', 0),   -- John Bennett
(16, 14, 22, 17, 'OK', 0),   -- Tasanapol Inthraphuvasak
(11, 14, 5, NULL, 'DNF', 0),   -- Sebastián Montoya
(30, 14, 7, NULL, 'DNF', 0),   -- Victor Martins
(18, 14, 21, NULL, 'DNF', 0),   -- Cian Shields
(14, 14, 11, NULL, 'DNF', 0),   -- Alexander Dunne
(21, 14, NULL, NULL, 'DNS', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
