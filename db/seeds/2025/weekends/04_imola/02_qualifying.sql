INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(7, 4, 1, 'OK'),   -- Dino Beganovic
(11, 4, 2, 'OK'),   -- Sebastián Montoya
(30, 4, 3, 'OK'),   -- Victor Martins
(23, 4, 4, 'OK'),   -- Leonardo Fornaroli
(14, 4, 5, 'OK'),   -- Alexander Dunne
(26, 4, 6, 'OK'),   -- Arvid Lindblad
(28, 4, 7, 'OK'),   -- Luke Browning
(10, 4, 8, 'OK'),   -- Oliver Goethe
(29, 4, 9, 'OK'),   -- Jak Crawford
(3, 4, 10, 'OK'),   -- Ritomo Miyata
(25, 4, 11, 'OK'),   -- Pepe Martí
(24, 4, 12, 'OK'),   -- Roman Staněk
(15, 4, 13, 'OK'),   -- Kush Maini
(2, 4, 14, 'OK'),   -- Joshua Dürksen
(9, 4, 15, 'OK'),   -- Gabriele Minì
(32, 4, 16, 'OK'),   -- Sami Meguetounif
(20, 4, 17, 'OK'),   -- Rafael Villagómez
(33, 4, 18, 'OK'),   -- Max Esterson
(27, 4, 19, 'OK'),   -- Richard Verschoor
(31, 4, 20, 'OK'),   -- Amaury Cordeel
(22, 4, 21, 'OK'),   -- John Bennett
(18, 4, 22, 'OK')
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
