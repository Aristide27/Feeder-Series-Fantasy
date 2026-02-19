INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(29, 3, 1, 'OK'),   -- Jak Crawford
(30, 3, 2, 'OK'),   -- Victor Martins
(23, 3, 3, 'OK'),   -- Leonardo Fornaroli
(28, 3, 4, 'OK'),   -- Luke Browning
(26, 3, 5, 'OK'),   -- Arvid Lindblad
(14, 3, 6, 'OK'),   -- Alexander Dunne
(25, 3, 7, 'OK'),   -- Pepe Martí
(9, 3, 8, 'OK'),   -- Gabriele Minì
(27, 3, 9, 'OK'),   -- Richard Verschoor
(24, 3, 10, 'OK'),   -- Roman Staněk
(10, 3, 11, 'OK'),   -- Oliver Goethe
(15, 3, 12, 'OK'),   -- Kush Maini
(7, 3, 13, 'OK'),   -- Dino Beganovic
(31, 3, 14, 'OK'),   -- Amaury Cordeel
(32, 3, 15, 'OK'),   -- Sami Meguetounif
(3, 3, 16, 'OK'),   -- Ritomo Miyata
(11, 3, 17, 'OK'),   -- Sebastián Montoya
(2, 3, 18, 'OK'),   -- Joshua Dürksen
(33, 3, 19, 'OK'),   -- Max Esterson
(20, 3, 20, 'OK'),   -- Rafael Villagómez
(22, 3, 21, 'OK'),   -- John Bennett
(18, 3, 22, 'OK')
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
