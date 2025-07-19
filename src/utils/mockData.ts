
// Mock data utilities for testing without authentication
export const MOCK_MODE = true; // Set to false for production

// Mock user profiles
export const mockUsers = [
  {
    id: 'user_001',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    handicap: 12,
    avatar_url: null,
    home_course: 'Pebble Beach Golf Links'
  },
  {
    id: 'user_002',
    email: 'sarah.smith@example.com',
    first_name: 'Sarah',
    last_name: 'Smith',
    handicap: 8,
    avatar_url: null,
    home_course: 'Augusta National Golf Club'
  },
  {
    id: 'user_003',
    email: 'mike.johnson@example.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    handicap: 15,
    avatar_url: null,
    home_course: 'St. Andrews Old Course'
  },
  {
    id: 'user_004',
    email: 'emily.davis@example.com',
    first_name: 'Emily',
    last_name: 'Davis',
    handicap: 6,
    avatar_url: null,
    home_course: 'Torrey Pines Golf Course'
  },
  {
    id: 'user_005',
    email: 'alex.wilson@example.com',
    first_name: 'Alex',
    last_name: 'Wilson',
    handicap: 18,
    avatar_url: null,
    home_course: 'Bethpage Black Course'
  },
  {
    id: 'user_006',
    email: 'lisa.brown@example.com',
    first_name: 'Lisa',
    last_name: 'Brown',
    handicap: 10,
    avatar_url: null,
    home_course: 'Pinehurst No. 2'
  },
  {
    id: 'user_007',
    email: 'david.garcia@example.com',
    first_name: 'David',
    last_name: 'Garcia',
    handicap: 14,
    avatar_url: null,
    home_course: 'TPC Sawgrass'
  },
  {
    id: 'user_008',
    email: 'jennifer.martinez@example.com',
    first_name: 'Jennifer',
    last_name: 'Martinez',
    handicap: 9,
    avatar_url: null,
    home_course: 'Whistling Straits'
  }
];

// Mock tournaments with various states and sizes
export const mockTournaments = [
  {
    id: 'tournament_001',
    name: 'Weekend Warriors Championship',
    description: 'Monthly weekend tournament for regular players',
    game_type: 'stroke',
    status: 'active',
    created_by: 'user_001',
    max_players: 16,
    entry_fee: 25,
    prize_pool: 400,
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    course_id: 'course_001',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      course: {
        name: 'Pebble Beach Golf Links',
        location: 'Pebble Beach, CA'
      }
    },
    rules: {}
  },
  {
    id: 'tournament_002',
    name: 'Club Championship 2024',
    description: 'Annual club championship - biggest tournament of the year',
    game_type: 'match_play',
    status: 'upcoming',
    created_by: 'user_002',
    max_players: 64,
    entry_fee: 100,
    prize_pool: 6400,
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    end_time: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    course_id: 'course_002',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      course: {
        name: 'Augusta National Golf Club',
        location: 'Augusta, GA'
      }
    },
    rules: {}
  },
  {
    id: 'tournament_003',
    name: 'Friday Evening Scramble',
    description: 'Weekly casual scramble for after-work golf',
    game_type: 'scramble',
    status: 'live',
    created_by: 'user_003',
    max_players: 12,
    entry_fee: 15,
    prize_pool: 180,
    start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    course_id: 'course_003',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      course: {
        name: 'TPC Sawgrass',
        location: 'Ponte Vedra Beach, FL'
      }
    },
    rules: {}
  },
  {
    id: 'tournament_004',
    name: 'Charity Golf Classic',
    description: 'Annual charity event supporting local community',
    game_type: 'best_ball',
    status: 'completed',
    created_by: 'user_004',
    max_players: 80,
    entry_fee: 150,
    prize_pool: 12000,
    start_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    course_id: 'course_004',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    settings: {
      course: {
        name: 'Torrey Pines Golf Course',
        location: 'La Jolla, CA'
      }
    },
    rules: {}
  }
];

// Mock tournament participants
export const mockTournamentParticipants = [
  // Weekend Warriors Championship participants
  { id: 'part_001', tournament_id: 'tournament_001', user_id: 'user_001', status: 'confirmed', handicap: 12, joined_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_002', tournament_id: 'tournament_001', user_id: 'user_002', status: 'confirmed', handicap: 8, joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_003', tournament_id: 'tournament_001', user_id: 'user_003', status: 'confirmed', handicap: 15, joined_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_004', tournament_id: 'tournament_001', user_id: 'user_004', status: 'confirmed', handicap: 6, joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  
  // Club Championship participants
  { id: 'part_005', tournament_id: 'tournament_002', user_id: 'user_002', status: 'confirmed', handicap: 8, joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_006', tournament_id: 'tournament_002', user_id: 'user_005', status: 'confirmed', handicap: 18, joined_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_007', tournament_id: 'tournament_002', user_id: 'user_006', status: 'confirmed', handicap: 10, joined_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  
  // Friday Evening Scramble participants (live tournament)
  { id: 'part_008', tournament_id: 'tournament_003', user_id: 'user_003', status: 'confirmed', handicap: 14, joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_009', tournament_id: 'tournament_003', user_id: 'user_007', status: 'confirmed', handicap: 14, joined_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_010', tournament_id: 'tournament_003', user_id: 'user_008', status: 'confirmed', handicap: 9, joined_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

// Mock press bets with various states
export const mockPressBets = [
  {
    id: 'bet_001',
    tournament_id: 'tournament_003',
    initiator_id: 'user_003',
    target_id: 'user_007',
    bet_type: 'closest_to_pin',
    amount: 10,
    status: 'pending',
    description: 'Closest to pin on hole 7 - island green challenge',
    hole_number: 7,
    location_lat: 30.1975,
    location_lng: -81.3927,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    completed_at: null,
    winner_id: null
  },
  {
    id: 'bet_002',
    tournament_id: 'tournament_003',
    initiator_id: 'user_007',
    target_id: 'user_008',
    bet_type: 'longest_drive',
    amount: 15,
    status: 'accepted',
    description: 'Longest drive on hole 10 - par 4 dogleg',
    hole_number: 10,
    location_lat: 30.1980,
    location_lng: -81.3925,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    completed_at: null,
    winner_id: null
  },
  {
    id: 'bet_003',
    tournament_id: 'tournament_001',
    initiator_id: 'user_001',
    target_id: 'user_002',
    bet_type: 'hole_winner',
    amount: 20,
    status: 'completed',
    description: 'Best score on signature hole 18',
    hole_number: 18,
    location_lat: 36.5681,
    location_lng: -121.9470,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    winner_id: 'user_002'
  }
];

// Mock courses with GPS coordinates
export const mockCourses = [
  {
    id: 'course_001',
    name: 'Pebble Beach Golf Links',
    location: 'Pebble Beach, CA',
    holes: 18,
    par: 72,
    rating: 74.8,
    slope: 144,
    latitude: 36.5681,
    longitude: -121.9470,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'course_002',
    name: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    holes: 18,
    par: 72,
    rating: 76.2,
    slope: 137,
    latitude: 33.5030,
    longitude: -82.0197,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'course_003',
    name: 'TPC Sawgrass',
    location: 'Ponte Vedra Beach, FL',
    holes: 18,
    par: 72,
    rating: 76.0,
    slope: 155,
    latitude: 30.1975,
    longitude: -81.3927,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Utility functions for mock data
export const getCurrentMockUser = (): typeof mockUsers[0] => {
  const storedUserId = localStorage.getItem('mockUserId');
  if (storedUserId) {
    const user = mockUsers.find(u => u.id === storedUserId);
    if (user) return user;
  }
  // Default to first user
  return mockUsers[0];
};

export const setCurrentMockUser = (userId: string) => {
  localStorage.setItem('mockUserId', userId);
  window.location.reload(); // Refresh to apply new user context
};

export const getMockSession = () => {
  if (!MOCK_MODE) return null;
  
  const user = getCurrentMockUser();
  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        first_name: user.first_name,
        last_name: user.last_name
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      phone: null,
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      role: 'authenticated',
      updated_at: new Date().toISOString()
    },
    access_token: 'mock_token',
    refresh_token: 'mock_refresh_token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer'
  };
};

// Get mock data filtered by current user
export const getMockTournamentsForUser = () => {
  const currentUser = getCurrentMockUser();
  return mockTournaments.filter(tournament => {
    const isCreator = tournament.created_by === currentUser.id;
    const isParticipant = mockTournamentParticipants.some(
      p => p.tournament_id === tournament.id && p.user_id === currentUser.id
    );
    return isCreator || isParticipant;
  });
};

export const getMockPressBetsForTournament = (tournamentId: string) => {
  return mockPressBets.filter(bet => bet.tournament_id === tournamentId);
};

export const getMockParticipantsForTournament = (tournamentId: string) => {
  return mockTournamentParticipants
    .filter(p => p.tournament_id === tournamentId)
    .map(participant => ({
      ...participant,
      profiles: mockUsers.find(u => u.id === participant.user_id)
    }));
};
