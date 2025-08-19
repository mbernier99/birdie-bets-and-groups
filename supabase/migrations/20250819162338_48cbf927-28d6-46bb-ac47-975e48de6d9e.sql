-- Remove all courses except Bandon Dunes courses
-- Keep: Bandon Dunes, Bandon Trails, Old Macdonald, Pacific Dunes, Sheep Ranch

-- First, delete related data for non-Bandon courses
DELETE FROM holes WHERE course_id IN (
  SELECT id FROM courses 
  WHERE location != 'Bandon, OR'
);

DELETE FROM course_tees WHERE course_id IN (
  SELECT id FROM courses 
  WHERE location != 'Bandon, OR'
);

DELETE FROM course_imports WHERE course_id IN (
  SELECT id FROM courses 
  WHERE location != 'Bandon, OR'
);

DELETE FROM user_course_favorites WHERE course_id IN (
  SELECT id FROM courses 
  WHERE location != 'Bandon, OR'
);

-- Delete rounds that reference non-Bandon courses
DELETE FROM shots WHERE round_id IN (
  SELECT r.id FROM rounds r
  JOIN courses c ON r.course_id = c.id
  WHERE c.location != 'Bandon, OR'
);

DELETE FROM hole_scores WHERE round_id IN (
  SELECT r.id FROM rounds r
  JOIN courses c ON r.course_id = c.id
  WHERE c.location != 'Bandon, OR'
);

DELETE FROM rounds WHERE course_id IN (
  SELECT id FROM courses 
  WHERE location != 'Bandon, OR'
);

-- Update tournaments to remove course references for non-Bandon courses
UPDATE tournaments 
SET course_id = NULL 
WHERE course_id IN (
  SELECT id FROM courses 
  WHERE location != 'Bandon, OR'
);

-- Finally, delete the non-Bandon courses
DELETE FROM courses 
WHERE location != 'Bandon, OR';