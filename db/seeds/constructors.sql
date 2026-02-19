INSERT INTO constructors (name, slug, nationality, price) VALUES
('Invicta Racing', 'invicta', 'United Kingdom', 25),
('Hitech TGR', 'hitech', 'United Kingdom', 18),
('Campos Racing', 'campos', 'Spain', 18),
('DAMS Lucas Oil', 'dams', 'France', 16),
('MP Motorsport', 'mp', 'Netherlands', 14),
('PREMA Racing', 'prema', 'Italy', 15),
('Rodin Motorsport', 'rodin', 'New Zealand', 18),
('ART Grand Prix', 'art', 'France', 10),
('AIX Racing', 'aix', 'United Arab Emirates', 8),
('Van Amersfoort Racing', 'var', 'Netherlands', 8),
('Trident', 'trident', 'Italy', 8)
ON CONFLICT (slug) DO NOTHING;