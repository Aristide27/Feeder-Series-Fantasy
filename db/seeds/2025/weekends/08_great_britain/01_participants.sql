INSERT INTO weekend_participants (driver_id, race_weekend_id, car_number, constructor_id)
VALUES
(23, 8, 1, 1),   -- Leonardo Fornaroli, #1, Invicta Racing
(24, 8, 2, 1),   -- Roman Staněk, #2, Invicta Racing
(25, 8, 5, 3),   -- Pepe Martí, #5, Campos Racing
(26, 8, 6, 3),   -- Arvid Lindblad, #6, Campos Racing
(10, 8, 9, 5),   -- Oliver Goethe, #9, MP Motorsport
(27, 8, 10, 5),   -- Richard Verschoor, #10, MP Motorsport
(28, 8, 3, 2),   -- Luke Browning, #3, Hitech TGR
(7, 8, 4, 2),   -- Dino Beganovic, #4, Hitech TGR
(11, 8, 11, 6),   -- Sebastián Montoya, #11, PREMA Racing
(9, 8, 12, 6),   -- Gabriele Minì, #12, PREMA Racing
(29, 8, 7, 4),   -- Jak Crawford, #7, DAMS Lucas Oil
(15, 8, 8, 4),   -- Kush Maini, #8, DAMS Lucas Oil
(30, 8, 16, 8),   -- Victor Martins, #16, ART Grand Prix
(3, 8, 17, 8),   -- Ritomo Miyata, #17, ART Grand Prix
(31, 8, 14, 7),   -- Amaury Cordeel, #14, Rodin Motorsport
(14, 8, 15, 7),   -- Alexander Dunne, #15, Rodin Motorsport
(2, 8, 20, 9),   -- Joshua Dürksen, #20, AIX Racing
(18, 8, 21, 9),   -- Cian Shields, #21, AIX Racing
(32, 8, 24, 11),   -- Sami Meguetounif, #24, Trident
(33, 8, 25, 11),   -- Max Esterson, #25, Trident
(22, 8, 22, 10),   -- John Bennett, #22, Van Amersfoort Racing
(20, 8, 23, 10)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
