
export interface Press {
  id: string;
  tournamentId: string;
  initiatorId: string;
  targetId: string;
  amount: number;
  currency: string;
  startHole: number;
  gameType: 'total-strokes' | 'head-to-head' | 'this-hole' | 'remaining-holes';
  winCondition: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'active' | 'completed';
  initiatedAt: number;
  respondedAt?: number;
  completedAt?: number;
  winner?: string;
  isCounter: boolean;
  originalPressId?: string;
  expiresAt: number;
}

export interface PressRequest {
  targetId: string;
  amount: number;
  startHole: number;
  gameType: 'total-strokes' | 'head-to-head' | 'this-hole' | 'remaining-holes';
  winCondition: string;
}

export interface PressCounter {
  pressId: string;
  amount?: number;
  gameType?: 'total-strokes' | 'head-to-head' | 'this-hole' | 'remaining-holes';
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
}

export interface PressValidation {
  isValid: boolean;
  reason?: string;
  warning?: string;
}
