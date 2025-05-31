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

export const getCourseDatabase = (): SavedCourse[] => {
  const saved = localStorage.getItem('golfCourseDatabase');
  return saved ? JSON.parse(saved) : [];
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
