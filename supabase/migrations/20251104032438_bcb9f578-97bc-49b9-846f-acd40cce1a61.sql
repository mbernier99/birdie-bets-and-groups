
-- Insert Sheep Ranch course
INSERT INTO courses (name, location, par, holes, rating, slope, latitude, longitude)
VALUES (
  'Sheep Ranch',
  'Bandon, Oregon',
  72,
  18,
  70.0,
  116,
  43.1193,
  -124.4148
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Store the course ID in a variable for subsequent inserts
DO $$
DECLARE
  v_course_id uuid;
  v_green_tee_id uuid;
  v_gold_tee_id uuid;
BEGIN
  -- Get the course ID
  SELECT id INTO v_course_id
  FROM courses
  WHERE name = 'Sheep Ranch'
  LIMIT 1;

  -- Insert Green tee
  INSERT INTO course_tees (course_id, tee_name, tee_color, rating, slope, total_yardage)
  VALUES (v_course_id, 'Green', '#22c55e', 70.0, 116, 6245)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_green_tee_id;

  -- Get green tee id if insert was skipped
  IF v_green_tee_id IS NULL THEN
    SELECT id INTO v_green_tee_id
    FROM course_tees
    WHERE course_id = v_course_id AND tee_name = 'Green'
    LIMIT 1;
  END IF;

  -- Insert Gold tee
  INSERT INTO course_tees (course_id, tee_name, tee_color, rating, slope, total_yardage)
  VALUES (v_course_id, 'Gold', '#eab308', 67.9, 109, 5810)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_gold_tee_id;

  -- Get gold tee id if insert was skipped
  IF v_gold_tee_id IS NULL THEN
    SELECT id INTO v_gold_tee_id
    FROM course_tees
    WHERE course_id = v_course_id AND tee_name = 'Gold'
    LIMIT 1;
  END IF;

  -- Insert holes for Green tees
  INSERT INTO holes (course_id, tee_id, hole_number, par, yardage, handicap) VALUES
  (v_course_id, v_green_tee_id, 1, 5, 517, 5),
  (v_course_id, v_green_tee_id, 2, 4, 303, 13),
  (v_course_id, v_green_tee_id, 3, 3, 113, 17),
  (v_course_id, v_green_tee_id, 4, 4, 443, 3),
  (v_course_id, v_green_tee_id, 5, 3, 166, 11),
  (v_course_id, v_green_tee_id, 6, 4, 431, 1),
  (v_course_id, v_green_tee_id, 7, 3, 138, 15),
  (v_course_id, v_green_tee_id, 8, 4, 407, 7),
  (v_course_id, v_green_tee_id, 9, 4, 386, 9),
  (v_course_id, v_green_tee_id, 10, 4, 375, 6),
  (v_course_id, v_green_tee_id, 11, 5, 506, 4),
  (v_course_id, v_green_tee_id, 12, 4, 414, 2),
  (v_course_id, v_green_tee_id, 13, 5, 485, 10),
  (v_course_id, v_green_tee_id, 14, 4, 377, 8),
  (v_course_id, v_green_tee_id, 15, 4, 303, 14),
  (v_course_id, v_green_tee_id, 16, 3, 131, 16),
  (v_course_id, v_green_tee_id, 17, 4, 314, 12),
  (v_course_id, v_green_tee_id, 18, 5, 436, 18)
  ON CONFLICT DO NOTHING;

  -- Insert holes for Gold tees
  INSERT INTO holes (course_id, tee_id, hole_number, par, yardage, handicap) VALUES
  (v_course_id, v_gold_tee_id, 1, 5, 491, 5),
  (v_course_id, v_gold_tee_id, 2, 4, 282, 13),
  (v_course_id, v_gold_tee_id, 3, 3, 101, 17),
  (v_course_id, v_gold_tee_id, 4, 4, 415, 3),
  (v_course_id, v_gold_tee_id, 5, 3, 139, 11),
  (v_course_id, v_gold_tee_id, 6, 4, 401, 1),
  (v_course_id, v_gold_tee_id, 7, 3, 110, 15),
  (v_course_id, v_gold_tee_id, 8, 4, 382, 7),
  (v_course_id, v_gold_tee_id, 9, 4, 361, 9),
  (v_course_id, v_gold_tee_id, 10, 4, 356, 6),
  (v_course_id, v_gold_tee_id, 11, 5, 463, 4),
  (v_course_id, v_gold_tee_id, 12, 4, 390, 2),
  (v_course_id, v_gold_tee_id, 13, 5, 464, 10),
  (v_course_id, v_gold_tee_id, 14, 4, 354, 8),
  (v_course_id, v_gold_tee_id, 15, 4, 279, 14),
  (v_course_id, v_gold_tee_id, 16, 3, 120, 16),
  (v_course_id, v_gold_tee_id, 17, 4, 297, 12),
  (v_course_id, v_gold_tee_id, 18, 5, 405, 18)
  ON CONFLICT DO NOTHING;

END $$;
