INSERT INTO weekend_participants (driver_id, race_weekend_id, car_number, constructor_id)
VALUES
(1, 15, 1, 1),     -- Rafael Câmara,            #1, Invicta Racing
(2, 15, 2, 1),     -- Joshua Dürksen,           #2, Invicta Racing
(3, 15, 3, 2),     -- Ritomo Miyata,            #3, Hitech TGR
(4, 15, 4, 2),     -- Colton Herta,             #4, Hitech TGR
(5, 15, 5, 3),     -- Noel León,                #5, Campos Racing
(6, 15, 6, 3),     -- Nikola Tsolov,            #6, Campos Racing
(7, 15, 7, 4),     -- Dino Beganovic,           #7, DAMS Lucas Oil
(8, 15, 8, 4),     -- Roman Bilinski,           #8, DAMS Lucas Oil
(9, 15, 9, 5),     -- Gabriele Minì,            #9, MP Motorsport
(10, 15, 10, 5),   -- Oliver Goethe,            #10, MP Motorsport
(11, 15, 11, 6),   -- Sebastián Montoya,        #11, PREMA Racing
(12, 15, 12, 6),   -- Mari Boya,                #12, PREMA Racing
(13, 15, 14, 7),   -- Martinius Stenshorne,     #14, Rodin Motorsport
(14, 15, 15, 7),   -- Alexander Dunne,          #15, Rodin Motorsport
(15, 15, 16, 8),   -- Kush Maini,               #16, ART Grand Prix
(16, 15, 17, 8),   -- Tasanapol Inthraphuvasak, #17, ART Grand Prix
(17, 15, 20, 9),   -- Emerson Fittipaldi Jr.,   #20, AIX Racing
(18, 15, 21, 9),   -- Cian Shields,             #21, AIX Racing
(19, 15, 22, 10),   -- Nicolás Varrone,         #22, Van Amersfoort Racing
(20, 15, 23, 10),   -- Rafael Villagómez,       #23, Van Amersfoort Racing
(21, 15, 24, 11),   -- Laurens van Hoepen,      #24, Trident
(22, 15, 25, 11)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
