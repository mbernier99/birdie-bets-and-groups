
export interface Press {
  id: string;
  tournamentId: string;
  initiatorId: string;
  targetId: string;
  amount: number;
  currency: string;
  startHole: number;
  gameType: 'match-play' | 'stroke-play' | 'hole-only';
  winCondition: string; // e.g., "next 3 holes", "back 9", "best ball"
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
  gameType: 'match-play' | 'stroke-play' | 'hole-only';
  winCondition: string;
}

export interface PressCounter {
  pressId: string;
  amount?: number;
  gameType?: 'match-play' | 'stroke-play' | 'hole-only';
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
