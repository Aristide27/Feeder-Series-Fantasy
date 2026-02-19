INSERT INTO weekend_participants (driver_id, race_weekend_id, car_number, constructor_id)
VALUES
(23, 2, 1, 1),   -- Leonardo Fornaroli, #1, Invicta Racing
(24, 2, 2, 1),   -- Roman Staněk, #2, Invicta Racing
(25, 2, 5, 3),   -- Pepe Martí, #5, Campos Racing
(26, 2, 6, 3),   -- Arvid Lindblad, #6, Campos Racing
(10, 2, 9, 5),   -- Oliver Goethe, #9, MP Motorsport
(27, 2, 10, 5),   -- Richard Verschoor, #10, MP Motorsport
(28, 2, 3, 2),   -- Luke Browning, #3, Hitech TGR
(7, 2, 4, 2),   -- Dino Beganovic, #4, Hitech TGR
(11, 2, 11, 6),   -- Sebastián Montoya, #11, PREMA Racing
(9, 2, 12, 6),   -- Gabriele Minì, #12, PREMA Racing
(29, 2, 7, 4),   -- Jak Crawford, #7, DAMS Lucas Oil
(15, 2, 8, 4),   -- Kush Maini, #8, DAMS Lucas Oil
(30, 2, 16, 8),   -- Victor Martins, #16, ART Grand Prix
(3, 2, 17, 8),   -- Ritomo Miyata, #17, ART Grand Prix
(31, 2, 14, 7),   -- Amaury Cordeel, #14, Rodin Motorsport
(14, 2, 15, 7),   -- Alexander Dunne, #15, Rodin Motorsport
(2, 2, 20, 9),   -- Joshua Dürksen, #20, AIX Racing
(18, 2, 21, 9),   -- Cian Shields, #21, AIX Racing
(32, 2, 24, 11),   -- Sami Meguetounif, #24, Trident
(33, 2, 25, 11),   -- Max Esterson, #25, Trident
(22, 2, 22, 10),   -- John Bennett, #22, Van Amersfoort Racing
(20, 2, 23, 10)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
