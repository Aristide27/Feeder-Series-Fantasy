INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(14, 5, 1, 'OK'),   -- Alexander Dunne
(30, 5, 2, 'OK'),   -- Victor Martins
(27, 5, 3, 'OK'),   -- Richard Verschoor
(26, 5, 4, 'OK'),   -- Arvid Lindblad
(9, 5, 5, 'OK'),   -- Gabriele Minì
(15, 5, 6, 'OK'),   -- Kush Maini
(23, 5, 7, 'OK'),   -- Leonardo Fornaroli
(11, 5, 8, 'OK'),   -- Sebastián Montoya
(29, 5, 9, 'OK'),   -- Jak Crawford
(2, 5, 10, 'OK'),   -- Joshua Dürksen
(28, 5, 11, 'OK'),   -- Luke Browning
(24, 5, 12, 'OK'),   -- Roman Staněk
(3, 5, 13, 'OK'),   -- Ritomo Miyata
(31, 5, 14, 'OK'),   -- Amaury Cordeel
(7, 5, 15, 'OK'),   -- Dino Beganovic
(32, 5, 16, 'OK'),   -- Sami Meguetounif
(10, 5, 17, 'OK'),   -- Oliver Goethe
(25, 5, 18, 'OK'),   -- Pepe Martí
(33, 5, 19, 'OK'),   -- Max Esterson
(22, 5, 20, 'OK'),   -- John Bennett
(18, 5, 21, 'OK')
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
