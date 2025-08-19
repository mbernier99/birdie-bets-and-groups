-- Insert seed data for Bandon Dunes courses
INSERT INTO courses (name, location, par, holes) VALUES 
('Bandon Dunes', 'Bandon, OR', 72, 18),
('Pacific Dunes', 'Bandon, OR', 71, 18),
('Bandon Trails', 'Bandon, OR', 71, 18),
('Old Macdonald', 'Bandon, OR', 71, 18),
('Sheep Ranch', 'Bandon, OR', 72, 18)
ON CONFLICT (name) DO NOTHING;

-- Insert tee sets for each course
WITH course_ids AS (
  SELECT id, name FROM courses WHERE location = 'Bandon, OR'
)
INSERT INTO course_tees (course_id, tee_name, tee_color) 
SELECT 
  c.id,
  t.tee_name,
  t.tee_color
FROM course_ids c
CROSS JOIN (
  VALUES 
    ('Black', 'Black'),
    ('Green', 'Green'), 
    ('Gold', 'Gold'),
    ('Orange', 'Orange'),
    ('White', 'White'),
    ('Red', 'Red')
) AS t(tee_name, tee_color)
ON CONFLICT DO NOTHING;

-- Create seed users with realistic names (16 demo users)
INSERT INTO profiles (id, email, display_name, role) VALUES 
(gen_random_uuid(), 'john.smith@email.com', 'John Smith', 'organizer'),
(gen_random_uuid(), 'mike.johnson@email.com', 'Mike Johnson', 'player'),
(gen_random_uuid(), 'david.wilson@email.com', 'David Wilson', 'player'),
(gen_random_uuid(), 'chris.brown@email.com', 'Chris Brown', 'player'),
(gen_random_uuid(), 'matt.davis@email.com', 'Matt Davis', 'player'),
(gen_random_uuid(), 'steve.miller@email.com', 'Steve Miller', 'player'),
(gen_random_uuid(), 'tom.anderson@email.com', 'Tom Anderson', 'player'),
(gen_random_uuid(), 'rob.taylor@email.com', 'Rob Taylor', 'player'),
(gen_random_uuid(), '+15551234567', 'Jake Williams', 'player'),
(gen_random_uuid(), '+15551234568', 'Ryan Jones', 'player'),
(gen_random_uuid(), 'kevin.garcia@email.com', 'Kevin Garcia', 'player'),
(gen_random_uuid(), '+15551234569', 'Brian Rodriguez', 'player'),
(gen_random_uuid(), 'alex.martinez@email.com', 'Alex Martinez', 'player'),
(gen_random_uuid(), 'jason.lopez@email.com', 'Jason Lopez', 'player'),
(gen_random_uuid(), '+15551234570', 'Mark Gonzalez', 'player'),
(gen_random_uuid(), 'tyler.perez@email.com', 'Tyler Perez', 'player')
ON CONFLICT (id) DO NOTHING;