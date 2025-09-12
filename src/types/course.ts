// Enhanced course data types for course-aware shot tracking

export interface CourseCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number; // GPS accuracy in meters
  timestamp?: number;
}

export interface CourseReferencePoint {
  id: string;
  type: 'tee_marker' | 'pin' | 'fairway_marker' | 'sprinkler_head' | 'cart_path' | 'bunker' | 'tree' | 'building';
  name: string; // e.g., "150 Yard Marker", "Red Tee", "Pin Position"
  coordinates: CourseCoordinate;
  description?: string;
  photoUrl?: string;
  userContributed?: boolean;
  confidenceScore?: number; // 0-1 based on verification
  lastVerified?: number; // timestamp
  holeNumber?: number; // which hole this reference point relates to
}

export interface EnhancedHoleData {
  number: number;
  par: number;
  yardage: number;
  handicapIndex: number;
  // Enhanced positioning data
  teeBoxes: {
    [color: string]: {
      coordinates: CourseCoordinate;
      yardage: number;
      rating?: number;
    };
  };
  pinPositions: {
    front?: CourseCoordinate;
    middle?: CourseCoordinate;
    back?: CourseCoordinate;
    current?: CourseCoordinate; // Today's pin position
  };
  greenBoundary?: CourseCoordinate[];
  fairwayBoundary?: CourseCoordinate[];
  hazards?: {
    type: 'water' | 'sand' | 'trees';
    boundary: CourseCoordinate[];
  }[];
  referencePoints?: CourseReferencePoint[];
}

export interface EnhancedCourseData {
  id?: string;
  name: string;
  location?: string;
  teeBox: string;
  rating: number;
  slope: number;
  holes: EnhancedHoleData[];
  // Enhanced course data
  courseCenter?: CourseCoordinate;
  courseBoundary?: CourseCoordinate[];
  clubhouse?: CourseCoordinate;
  parkingArea?: CourseCoordinate;
  referencePoints?: CourseReferencePoint[];
  // Crowd-sourced improvements
  contributorCount?: number;
  lastUpdated?: number;
  accuracyRating?: number; // 0-1 based on user feedback
}

export interface ShotValidationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  estimatedAccuracy: number; // in meters
  coursePosition?: {
    hole: number;
    area: 'tee' | 'fairway' | 'rough' | 'green' | 'hazard' | 'out_of_bounds';
    distanceToPin?: number;
    distanceToTee?: number;
  };
}

export interface PhotoVerification {
  id: string;
  shotId: string;
  playerId: string;
  photoUrl: string;
  referencePointsVisible: string[]; // IDs of reference points visible in photo
  timestamp: number;
  verified?: boolean;
  verificationNotes?: string;
}

export interface ReferencePointBet {
  id: string;
  tournamentId: string;
  holeNumber: number;
  referencePointId: string;
  betType: 'closest_to_reference' | 'over_under_reference';
  description: string;
  amount: number;
  participants: string[]; // player IDs
  status: 'open' | 'closed' | 'resolved';
  winner?: string;
  createdAt: number;
  expiresAt?: number;
}