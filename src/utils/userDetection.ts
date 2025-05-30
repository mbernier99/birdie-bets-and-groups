
export interface UserActivity {
  hasPlayedTournaments: boolean;
  totalTournaments: number;
  totalWinnings: number;
  lastActivity: Date | null;
}

export const detectUserActivity = (): UserActivity => {
  try {
    // Check for saved tournaments
    const savedTournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    
    // Check for any stored winnings/stats
    const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
    
    // Check for any game history
    const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    
    const hasActivity = savedTournaments.length > 0 || 
                       gameHistory.length > 0 || 
                       Object.keys(userStats).length > 0;
    
    return {
      hasPlayedTournaments: hasActivity,
      totalTournaments: savedTournaments.length + gameHistory.length,
      totalWinnings: userStats.totalWinnings || 0,
      lastActivity: userStats.lastActivity ? new Date(userStats.lastActivity) : null
    };
  } catch (error) {
    console.error('Error detecting user activity:', error);
    return {
      hasPlayedTournaments: false,
      totalTournaments: 0,
      totalWinnings: 0,
      lastActivity: null
    };
  }
};

export const isFirstTimeUser = (): boolean => {
  const activity = detectUserActivity();
  return !activity.hasPlayedTournaments;
};
