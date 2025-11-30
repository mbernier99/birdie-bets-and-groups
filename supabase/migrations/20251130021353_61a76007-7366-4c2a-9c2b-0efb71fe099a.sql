-- Insert Presidio Golf Course
INSERT INTO public.courses (id, name, location, holes, par, rating, slope, latitude, longitude)
VALUES (
  gen_random_uuid(),
  'Presidio Golf Course',
  'San Francisco, CA',
  18,
  72,
  71.0,
  133,
  37.7989,
  -122.4610
);

-- Get the course_id we just created (using a CTE pattern for the rest)
WITH course AS (
  SELECT id FROM public.courses WHERE name = 'Presidio Golf Course' LIMIT 1
),
-- Insert White Tees
white_tee AS (
  INSERT INTO public.course_tees (id, course_id, tee_name, tee_color, rating, slope, total_yardage)
  SELECT gen_random_uuid(), course.id, 'White', 'white', 71.0, 133, 6103
  FROM course
  RETURNING id, course_id
),
-- Insert Blue Tees
blue_tee AS (
  INSERT INTO public.course_tees (id, course_id, tee_name, tee_color, rating, slope, total_yardage)
  SELECT gen_random_uuid(), course.id, 'Blue', 'blue', 69.4, 128, 5746
  FROM course
  RETURNING id, course_id
),
-- Insert all 18 holes with base data (par and handicap)
holes_insert AS (
  INSERT INTO public.holes (id, course_id, hole_number, par, handicap)
  SELECT 
    gen_random_uuid(),
    course.id,
    hole_data.hole_number,
    hole_data.par,
    hole_data.handicap
  FROM course, (VALUES
    (1, 4, 7), (2, 5, 15), (3, 4, 1), (4, 3, 17), (5, 4, 13),
    (6, 4, 3), (7, 3, 5), (8, 4, 9), (9, 5, 11),
    (10, 5, 10), (11, 4, 4), (12, 4, 2), (13, 3, 12), (14, 4, 14),
    (15, 3, 16), (16, 4, 8), (17, 4, 6), (18, 5, 18)
  ) AS hole_data(hole_number, par, handicap)
  RETURNING id, course_id, hole_number
)
-- Now we need to insert hole_tees for both tee sets
SELECT 1; -- Placeholder to complete the CTE

-- Insert holes and hole_tees in separate statements for clarity
-- First, let's get all holes for this course and add hole_tees

-- Insert White tee yardages for each hole
INSERT INTO public.hole_tees (hole_id, tee_id, yardage)
SELECT h.id, ct.id, yd.yardage
FROM public.holes h
JOIN public.courses c ON h.course_id = c.id
JOIN public.course_tees ct ON ct.course_id = c.id AND ct.tee_name = 'White'
JOIN (VALUES
  (1, 349), (2, 435), (3, 365), (4, 118), (5, 298),
  (6, 361), (7, 184), (8, 356), (9, 493),
  (10, 486), (11, 387), (12, 442), (13, 169), (14, 326),
  (15, 147), (16, 364), (17, 343), (18, 480)
) AS yd(hole_number, yardage) ON h.hole_number = yd.hole_number
WHERE c.name = 'Presidio Golf Course';

-- Insert Blue tee yardages for each hole
INSERT INTO public.hole_tees (hole_id, tee_id, yardage)
SELECT h.id, ct.id, yd.yardage
FROM public.holes h
JOIN public.courses c ON h.course_id = c.id
JOIN public.course_tees ct ON ct.course_id = c.id AND ct.tee_name = 'Blue'
JOIN (VALUES
  (1, 339), (2, 411), (3, 348), (4, 108), (5, 289),
  (6, 347), (7, 175), (8, 348), (9, 440),
  (10, 469), (11, 373), (12, 368), (13, 156), (14, 304),
  (15, 133), (16, 338), (17, 335), (18, 465)
) AS yd(hole_number, yardage) ON h.hole_number = yd.hole_number
WHERE c.name = 'Presidio Golf Course';