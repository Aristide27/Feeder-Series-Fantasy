INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(28, 11, 1, 'OK'),   -- Luke Browning
(15, 11, 2, 'OK'),   -- Kush Maini
(24, 11, 3, 'OK'),   -- Roman Staněk
(10, 11, 4, 'OK'),   -- Oliver Goethe
(14, 11, 5, 'OK'),   -- Alexander Dunne
(26, 11, 6, 'OK'),   -- Arvid Lindblad
(2, 11, 7, 'OK'),   -- Joshua Dürksen
(23, 11, 8, 'OK'),   -- Leonardo Fornaroli
(32, 11, 9, 'OK'),   -- Sami Meguetounif
(7, 11, 10, 'OK'),   -- Dino Beganovic
(29, 11, 11, 'OK'),   -- Jak Crawford
(30, 11, 12, 'OK'),   -- Victor Martins
(25, 11, 13, 'OK'),   -- Pepe Martí
(27, 11, 14, 'OK'),   -- Richard Verschoor
(9, 11, 15, 'OK'),   -- Gabriele Minì
(20, 11, 16, 'OK'),   -- Rafael Villagómez
(22, 11, 17, 'OK'),   -- John Bennett
(3, 11, 18, 'OK'),   -- Ritomo Miyata
(18, 11, 19, 'OK'),   -- Cian Shields
(31, 11, 20, 'OK'),   -- Amaury Cordeel
(11, 11, 21, 'OK'),   -- Sebastián Montoya
(33, 11, 22, 'OK')
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
