INSERT INTO constructors (name, slug, nationality, price) VALUES
('Invicta Racing', 'invicta', 'United Kingdom', 22),
('Hitech TGR', 'hitech', 'United Kingdom', 14.5),
('Campos Racing', 'campos', 'Spain', 17.5),
('DAMS Lucas Oil', 'dams', 'France', 17),
('MP Motorsport', 'mp', 'Netherlands', 15),
('PREMA Racing', 'prema', 'Italy', 15.5),
('Rodin Motorsport', 'rodin', 'New Zealand', 20),
('ART Grand Prix', 'art', 'France', 10.5),
('AIX Racing', 'aix', 'United Arab Emirates', 6),
('Van Amersfoort Racing', 'var', 'Netherlands', 8.5),
('Trident', 'trident', 'Italy', 8.5)
ON CONFLICT (slug) DO NOTHING;