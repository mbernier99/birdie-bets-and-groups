export interface SavedCourse {
  name: string;
  teeBox: string;
  rating: number;
  slope: number;
  holes: Array<{
    number: number;
    par: number;
    yardage: number;
    handicapIndex: number;
  }>;
  lastUsed: string;
}

const DEFAULT_COURSES: SavedCourse[] = [
  {
    name: 'Sheep Ranch',
    teeBox: 'Green',
    rating: 70.0,
    slope: 116,
    holes: [
      { number: 1, par: 5, yardage: 517, handicapIndex: 5 },
      { number: 2, par: 4, yardage: 303, handicapIndex: 13 },
      { number: 3, par: 3, yardage: 113, handicapIndex: 17 },
      { number: 4, par: 4, yardage: 443, handicapIndex: 3 },
      { number: 5, par: 3, yardage: 166, handicapIndex: 11 },
      { number: 6, par: 4, yardage: 431, handicapIndex: 1 },
      { number: 7, par: 3, yardage: 138, handicapIndex: 15 },
      { number: 8, par: 4, yardage: 407, handicapIndex: 7 },
      { number: 9, par: 4, yardage: 386, handicapIndex: 9 },
      { number: 10, par: 4, yardage: 375, handicapIndex: 6 },
      { number: 11, par: 5, yardage: 506, handicapIndex: 4 },
      { number: 12, par: 4, yardage: 414, handicapIndex: 2 },
      { number: 13, par: 5, yardage: 485, handicapIndex: 10 },
      { number: 14, par: 4, yardage: 377, handicapIndex: 8 },
      { number: 15, par: 4, yardage: 303, handicapIndex: 14 },
      { number: 16, par: 3, yardage: 131, handicapIndex: 16 },
      { number: 17, par: 4, yardage: 314, handicapIndex: 12 },
      { number: 18, par: 5, yardage: 436, handicapIndex: 18 },
    ],
    lastUsed: new Date().toISOString()
  },
  {
    name: 'Sheep Ranch',
    teeBox: 'Gold',
    rating: 67.9,
    slope: 109,
    holes: [
      { number: 1, par: 5, yardage: 491, handicapIndex: 5 },
      { number: 2, par: 4, yardage: 282, handicapIndex: 13 },
      { number: 3, par: 3, yardage: 101, handicapIndex: 17 },
      { number: 4, par: 4, yardage: 415, handicapIndex: 3 },
      { number: 5, par: 3, yardage: 139, handicapIndex: 11 },
      { number: 6, par: 4, yardage: 401, handicapIndex: 1 },
      { number: 7, par: 3, yardage: 110, handicapIndex: 15 },
      { number: 8, par: 4, yardage: 382, handicapIndex: 7 },
      { number: 9, par: 4, yardage: 361, handicapIndex: 9 },
      { number: 10, par: 4, yardage: 356, handicapIndex: 6 },
      { number: 11, par: 5, yardage: 463, handicapIndex: 4 },
      { number: 12, par: 4, yardage: 390, handicapIndex: 2 },
      { number: 13, par: 5, yardage: 464, handicapIndex: 10 },
      { number: 14, par: 4, yardage: 354, handicapIndex: 8 },
      { number: 15, par: 4, yardage: 279, handicapIndex: 14 },
      { number: 16, par: 3, yardage: 120, handicapIndex: 16 },
      { number: 17, par: 4, yardage: 297, handicapIndex: 12 },
      { number: 18, par: 5, yardage: 405, handicapIndex: 18 },
    ],
    lastUsed: new Date().toISOString()
  }
];

export const getCourseDatabase = (): SavedCourse[] => {
  const saved = localStorage.getItem('golfCourseDatabase');
  const courses = saved ? JSON.parse(saved) : [];
  
  // Merge with default courses if they don't exist
  const existingNames = courses.map((c: SavedCourse) => `${c.name}-${c.teeBox}`);
  const newDefaults = DEFAULT_COURSES.filter(
    dc => !existingNames.includes(`${dc.name}-${dc.teeBox}`)
  );
  
  if (newDefaults.length > 0) {
    const updated = [...courses, ...newDefaults];
    localStorage.setItem('golfCourseDatabase', JSON.stringify(updated));
    return updated;
  }
  
  return courses;
};

export const saveCourseToDatabase = (course: SavedCourse): void => {
  const database = getCourseDatabase();
  const existingIndex = database.findIndex(c => c.name.toLowerCase() === course.name.toLowerCase());
  
  const courseToSave = {
    ...course,
    lastUsed: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    database[existingIndex] = courseToSave;
  } else {
    database.push(courseToSave);
  }
  
  // Keep only the 50 most recently used courses to prevent excessive storage
  database.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
  const trimmedDatabase = database.slice(0, 50);
  
  localStorage.setItem('golfCourseDatabase', JSON.stringify(trimmedDatabase));
};

export const findCourseByName = (courseName: string): SavedCourse | null => {
  if (!courseName.trim()) return null;
  
  const database = getCourseDatabase();
  return database.find(course => 
    course.name.toLowerCase().includes(courseName.toLowerCase().trim())
  ) || null;
};

export const searchCoursesByName = (searchTerm: string): SavedCourse[] => {
  if (!searchTerm.trim()) return [];
  
  const database = getCourseDatabase();
  return database
    .filter(course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 10); // Return top 10 matches
};
