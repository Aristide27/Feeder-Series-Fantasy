INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(24, 10, 1, 'OK'),   -- Roman Staněk
(23, 10, 2, 'OK'),   -- Leonardo Fornaroli
(29, 10, 3, 'OK'),   -- Jak Crawford
(28, 10, 4, 'OK'),   -- Luke Browning
(2, 10, 5, 'OK'),   -- Joshua Dürksen
(10, 10, 6, 'OK'),   -- Oliver Goethe
(30, 10, 7, 'OK'),   -- Victor Martins
(26, 10, 8, 'OK'),   -- Arvid Lindblad
(14, 10, 9, 'OK'),   -- Alexander Dunne
(25, 10, 10, 'OK'),   -- Pepe Martí
(27, 10, 11, 'OK'),   -- Richard Verschoor
(9, 10, 12, 'OK'),   -- Gabriele Minì
(31, 10, 13, 'OK'),   -- Amaury Cordeel
(7, 10, 14, 'OK'),   -- Dino Beganovic
(22, 10, 15, 'OK'),   -- John Bennett
(20, 10, 16, 'OK'),   -- Rafael Villagómez
(3, 10, 17, 'OK'),   -- Ritomo Miyata
(11, 10, 18, 'OK'),   -- Sebastián Montoya
(32, 10, 19, 'OK'),   -- Sami Meguetounif
(15, 10, 20, 'OK'),   -- Kush Maini
(33, 10, 21, 'OK'),   -- Max Esterson
(18, 10, 22, 'OK')
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
