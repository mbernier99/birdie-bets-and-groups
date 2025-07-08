
export interface Press {
  id: string;
  tournamentId: string;
  initiatorId: string;
  targetId: string;
  amount: number;
  currency: string;
  startHole: number;
  gameType: 'total-strokes' | 'head-to-head' | 'this-hole' | 'remaining-holes' | 'closest-to-pin' | 'longest-drive' | 'first-to-green' | 'course-position';
  winCondition: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'active' | 'completed';
  initiatedAt: number;
  respondedAt?: number;
  completedAt?: number;
  winner?: string;
  isCounter: boolean;
  originalPressId?: string;
  expiresAt: number;
  // Location-based betting fields
  requiresGPS?: boolean;
  targetLocation?: {
    latitude: number;
    longitude: number;
    hole: number;
    type: 'tee' | 'pin' | 'green' | 'fairway';
  };
  participantShots?: Array<{
    playerId: string;
    location: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: number;
    };
    distance?: number;
    verified: boolean;
  }>;
}

export interface PressRequest {
  targetId: string;
  amount: number;
  startHole: number;
  gameType: 'total-strokes' | 'head-to-head' | 'this-hole' | 'remaining-holes' | 'closest-to-pin' | 'longest-drive' | 'first-to-green' | 'course-position';
  winCondition: string;
  requiresGPS?: boolean;
  targetLocation?: {
    latitude: number;
    longitude: number;
    hole: number;
    type: 'tee' | 'pin' | 'green' | 'fairway';
  };
}

export interface PressCounter {
  pressId: string;
  amount?: number;
  gameType?: 'total-strokes' | 'head-to-head' | 'this-hole' | 'remaining-holes' | 'closest-to-pin' | 'longest-drive' | 'first-to-green' | 'course-position';
  winCondition?: string;
}

export interface PressNotification {
  id: string;
  pressId: string;
  type: 'new-press' | 'counter' | 'accepted' | 'declined' | 'expired';
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

export interface CourseHole {
  number: number;
  par: number;
  yardage: number;
  handicapIndex: number;
  teeLocation?: {
    latitude: number;
    longitude: number;
  };
  pinLocation?: {
    latitude: number;
    longitude: number;
  };
  greenBounds?: Array<{
    latitude: number;
    longitude: number;
  }>;
}

export interface PressValidation {
  isValid: boolean;
  reason?: string;
  warning?: string;
}

export interface LocationBasedBet {
  id: string;
  pressId: string;
  betType: 'closest-to-pin' | 'longest-drive' | 'first-to-green';
  targetHole: number;
  targetLocation: {
    latitude: number;
    longitude: number;
    type: 'tee' | 'pin' | 'green';
  };
  minAccuracy: number;
  autoResolve: boolean;
  resolutionData?: {
    winner: string;
    measurements: Array<{
      playerId: string;
      distance: number;
      verified: boolean;
    }>;
    resolvedAt: number;
  };
}
