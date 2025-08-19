-- Insert seed data for Bandon Dunes courses (avoiding conflicts)
DO $$
DECLARE
    bandon_dunes_id UUID;
    pacific_dunes_id UUID;
    bandon_trails_id UUID;
    old_macdonald_id UUID;
    sheep_ranch_id UUID;
BEGIN
    -- Insert courses if they don't exist
    INSERT INTO courses (name, location, par, holes) VALUES 
    ('Bandon Dunes', 'Bandon, OR', 72, 18)
    ON CONFLICT DO NOTHING
    RETURNING id INTO bandon_dunes_id;
    
    INSERT INTO courses (name, location, par, holes) VALUES 
    ('Pacific Dunes', 'Bandon, OR', 71, 18)
    ON CONFLICT DO NOTHING
    RETURNING id INTO pacific_dunes_id;
    
    INSERT INTO courses (name, location, par, holes) VALUES 
    ('Bandon Trails', 'Bandon, OR', 71, 18)
    ON CONFLICT DO NOTHING
    RETURNING id INTO bandon_trails_id;
    
    INSERT INTO courses (name, location, par, holes) VALUES 
    ('Old Macdonald', 'Bandon, OR', 71, 18)
    ON CONFLICT DO NOTHING
    RETURNING id INTO old_macdonald_id;
    
    INSERT INTO courses (name, location, par, holes) VALUES 
    ('Sheep Ranch', 'Bandon, OR', 72, 18)
    ON CONFLICT DO NOTHING
    RETURNING id INTO sheep_ranch_id;
END $$;