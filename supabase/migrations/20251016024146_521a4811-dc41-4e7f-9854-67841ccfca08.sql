-- Insert Castlewood Country Club - Hill Course
INSERT INTO courses (id, name, location, par, holes, rating, slope, latitude, longitude)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
  'Castlewood Country Club - Hill Course',
  'Pleasanton, CA',
  70,
  18,
  71.8,
  134,
  37.6625,
  -121.8747
);

-- Insert Castlewood Country Club - Valley Course
INSERT INTO courses (id, name, location, par, holes, rating, slope, latitude, longitude)
VALUES (
  'b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e',
  'Castlewood Country Club - Valley Course',
  'Pleasanton, CA',
  72,
  18,
  73.0,
  132,
  37.6625,
  -121.8747
);

-- Insert Black Tees for Hill Course
INSERT INTO course_tees (id, course_id, tee_name, tee_color, rating, slope, total_yardage)
VALUES (
  'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f',
  'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
  'Black',
  'black',
  71.8,
  134,
  6216
);

-- Insert Black Tees for Valley Course
INSERT INTO course_tees (id, course_id, tee_name, tee_color, rating, slope, total_yardage)
VALUES (
  'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a',
  'b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e',
  'Black',
  'black',
  73.0,
  132,
  6756
);

-- Insert holes for Hill Course (Black Tees)
INSERT INTO holes (course_id, tee_id, hole_number, par, yardage, handicap) VALUES
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 1, 4, 425, 3),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 2, 5, 469, 15),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 3, 4, 393, 13),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 4, 3, 182, 11),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 5, 4, 420, 1),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 6, 3, 137, 17),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 7, 4, 479, 7),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 8, 4, 404, 5),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 9, 4, 334, 9),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 10, 4, 275, 18),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 11, 5, 477, 12),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 12, 3, 135, 16),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 13, 4, 325, 10),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 14, 4, 370, 4),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 15, 4, 395, 2),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 16, 4, 389, 6),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 17, 3, 212, 8),
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 18, 4, 395, 14);

-- Insert holes for Valley Course (Black Tees)
INSERT INTO holes (course_id, tee_id, hole_number, par, yardage, handicap) VALUES
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 1, 4, 429, 2),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 2, 5, 518, 10),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 3, 4, 296, 8),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 4, 3, 167, 18),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 5, 4, 360, 12),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 6, 3, 205, 6),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 7, 4, 409, 4),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 8, 4, 344, 16),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 9, 5, 542, 14),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 10, 5, 561, 5),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 11, 3, 210, 9),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 12, 4, 380, 11),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 13, 4, 447, 3),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 14, 3, 125, 17),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 15, 4, 443, 1),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 16, 5, 544, 7),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 17, 4, 350, 15),
('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 18, 4, 426, 13);