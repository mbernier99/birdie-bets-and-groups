
// Mock data utilities for testing without authentication
export const MOCK_MODE = false; // Set to false for production

// Bandon Dunes golfers for testing
export const mockUsers = [
  {
    id: 'user_001',
    email: 'matt.bernier@email.com',
    first_name: 'Matt',
    last_name: 'Bernier',
    handicap: 12,
    avatar_url: null,
    home_course: 'Bandon Dunes Golf Resort'
  },
  {
    id: 'user_002',
    email: 'erin.whalen@email.com',
    first_name: 'Erin',
    last_name: 'Whalen',
    handicap: 8,
    avatar_url: null,
    home_course: 'Bandon Dunes Golf Resort'
  },
  {
    id: 'user_003',
    email: 'scott.gannon@email.com',
    first_name: 'Scott',
    last_name: 'Gannon',
    handicap: 15,
    avatar_url: null,
    home_course: 'Bandon Dunes Golf Resort'
  },
  {
    id: 'user_004',
    email: 'matt.traiman@email.com',
    first_name: 'Matt',
    last_name: 'Traiman',
    handicap: 6,
    avatar_url: null,
    home_course: 'Bandon Dunes Golf Resort'
  },
  {
    id: 'user_005',
    email: 'drew.tornga@email.com',
    first_name: 'Drew',
    last_name: 'Tornga',
    handicap: 18,
    avatar_url: null,
    home_course: 'Bandon Dunes Golf Resort'
  },
  {
    id: 'user_006',
    email: 'hector.saldivar@email.com',
    first_name: 'Hector',
    last_name: 'Saldivar',
    handicap: 10,
    avatar_url: null,
    home_course: 'Bandon Dunes Golf Resort'
  },
  {
    id: 'user_007',
    email: 'lee.crocker@email.com',
    first_name: 'Lee',
    last_name: 'Crocker',
    handicap: 14,
    avatar_url: null,
    home_course: 'Bandon Dunes Golf Resort'
  },
  {
    id: 'user_008',
    email: 'guest@email.com',
    first_name: "Whalen's",
    last_name: 'Guest',
    handicap: 9,
    avatar_url: null,
    home_course: 'Bandon Dunes Golf Resort'
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
  },
  // Bay Area Tournaments - Real Course Testing
  {
    id: 'tournament_005',
    name: 'Corica Park Challenge',
    description: 'Island tournament at Alameda - Test both North and South courses',
    game_type: 'stroke',
    status: 'upcoming',
    created_by: 'user_005',
    max_players: 24,
    entry_fee: 40,
    prize_pool: 960,
    start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    course_id: 'course_006',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      course: {
        name: 'Corica Park South Course',
        location: 'Alameda, CA'
      }
    },
    rules: {}
  },
  {
    id: 'tournament_006',
    name: 'East Bay Championship',
    description: 'Championship at the challenging Boundary Oak course',
    game_type: 'match_play',
    status: 'active',
    created_by: 'user_006',
    max_players: 32,
    entry_fee: 75,
    prize_pool: 2400,
    start_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    course_id: 'course_007',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      course: {
        name: 'Boundary Oak Golf Course',
        location: 'Walnut Creek, CA'
      }
    },
    rules: {}
  },
  {
    id: 'tournament_007',
    name: 'CC Club Member Classic',
    description: 'Exclusive tournament at Contra Costa Country Club',
    game_type: 'modified_stableford',
    status: 'live',
    created_by: 'user_001',
    max_players: 16,
    entry_fee: 100,
    prize_pool: 1600,
    start_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    course_id: 'course_008',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      course: {
        name: 'Contra Costa Country Club',
        location: 'Pleasanton, CA'
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
  
  // Bay Area Tournament participants
  // Corica Park Challenge participants
  { id: 'part_011', tournament_id: 'tournament_005', user_id: 'user_005', status: 'confirmed', handicap: 18, joined_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_012', tournament_id: 'tournament_005', user_id: 'user_001', status: 'confirmed', handicap: 12, joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_013', tournament_id: 'tournament_005', user_id: 'user_004', status: 'confirmed', handicap: 6, joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  
  // East Bay Championship participants (active)
  { id: 'part_014', tournament_id: 'tournament_006', user_id: 'user_006', status: 'confirmed', handicap: 10, joined_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_015', tournament_id: 'tournament_006', user_id: 'user_002', status: 'confirmed', handicap: 8, joined_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_016', tournament_id: 'tournament_006', user_id: 'user_007', status: 'confirmed', handicap: 14, joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_017', tournament_id: 'tournament_006', user_id: 'user_008', status: 'confirmed', handicap: 9, joined_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  
  // CC Club Member Classic participants (live)
  { id: 'part_018', tournament_id: 'tournament_007', user_id: 'user_001', status: 'confirmed', handicap: 12, joined_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_019', tournament_id: 'tournament_007', user_id: 'user_003', status: 'confirmed', handicap: 15, joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'part_020', tournament_id: 'tournament_007', user_id: 'user_005', status: 'confirmed', handicap: 18, joined_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
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
  },
  // Bay Area Courses - Real Data
  {
    id: 'course_005',
    name: 'Corica Park North Course',
    location: 'Alameda, CA',
    holes: 9,
    par: 36,
    rating: 35.2,
    slope: 118,
    latitude: 37.7749,
    longitude: -122.2194,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    // Hole-by-hole data for 9-hole course
    holes_data: [
      { number: 1, par: 4, yardage: 345, handicap: 7 },
      { number: 2, par: 3, yardage: 165, handicap: 9 },
      { number: 3, par: 5, yardage: 485, handicap: 1 },
      { number: 4, par: 4, yardage: 380, handicap: 3 },
      { number: 5, par: 3, yardage: 140, handicap: 8 },
      { number: 6, par: 4, yardage: 310, handicap: 6 },
      { number: 7, par: 5, yardage: 520, handicap: 2 },
      { number: 8, par: 4, yardage: 395, handicap: 4 },
      { number: 9, par: 4, yardage: 360, handicap: 5 }
    ]
  },
  {
    id: 'course_006',
    name: 'Corica Park South Course',
    location: 'Alameda, CA',
    holes: 18,
    par: 72,
    rating: 72.8,
    slope: 126,
    latitude: 37.7735,
    longitude: -122.2180,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    // Championship course designed by Rees Jones
    holes_data: [
      { number: 1, par: 4, yardage: 410, handicap: 11 },
      { number: 2, par: 3, yardage: 185, handicap: 17 },
      { number: 3, par: 5, yardage: 525, handicap: 3 },
      { number: 4, par: 4, yardage: 385, handicap: 7 },
      { number: 5, par: 3, yardage: 155, handicap: 15 },
      { number: 6, par: 4, yardage: 445, handicap: 1 },
      { number: 7, par: 5, yardage: 580, handicap: 5 },
      { number: 8, par: 4, yardage: 365, handicap: 13 },
      { number: 9, par: 4, yardage: 420, handicap: 9 },
      { number: 10, par: 4, yardage: 395, handicap: 10 },
      { number: 11, par: 3, yardage: 175, handicap: 16 },
      { number: 12, par: 5, yardage: 515, handicap: 4 },
      { number: 13, par: 4, yardage: 425, handicap: 2 },
      { number: 14, par: 3, yardage: 165, handicap: 18 },
      { number: 15, par: 4, yardage: 375, handicap: 12 },
      { number: 16, par: 5, yardage: 545, handicap: 6 },
      { number: 17, par: 3, yardage: 195, handicap: 14 },
      { number: 18, par: 4, yardage: 435, handicap: 8 }
    ]
  },
  {
    id: 'course_007',
    name: 'Boundary Oak Golf Course',
    location: 'Walnut Creek, CA',
    holes: 18,
    par: 72,
    rating: 73.5,
    slope: 133,
    latitude: 37.9061,
    longitude: -122.0652,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    // Championship public course in East Bay hills
    holes_data: [
      { number: 1, par: 4, yardage: 395, handicap: 9 },
      { number: 2, par: 5, yardage: 535, handicap: 3 },
      { number: 3, par: 3, yardage: 180, handicap: 15 },
      { number: 4, par: 4, yardage: 430, handicap: 1 },
      { number: 5, par: 4, yardage: 350, handicap: 13 },
      { number: 6, par: 3, yardage: 165, handicap: 17 },
      { number: 7, par: 5, yardage: 520, handicap: 5 },
      { number: 8, par: 4, yardage: 405, handicap: 7 },
      { number: 9, par: 4, yardage: 380, handicap: 11 },
      { number: 10, par: 4, yardage: 415, handicap: 8 },
      { number: 11, par: 3, yardage: 195, handicap: 14 },
      { number: 12, par: 4, yardage: 445, handicap: 2 },
      { number: 13, par: 5, yardage: 565, handicap: 4 },
      { number: 14, par: 4, yardage: 360, handicap: 12 },
      { number: 15, par: 3, yardage: 170, handicap: 16 },
      { number: 16, par: 4, yardage: 425, handicap: 6 },
      { number: 17, par: 5, yardage: 490, handicap: 10 },
      { number: 18, par: 4, yardage: 440, handicap: 18 }
    ]
  },
  {
    id: 'course_008',
    name: 'Contra Costa Country Club',
    location: 'Pleasanton, CA',
    holes: 18,
    par: 72,
    rating: 74.2,
    slope: 135,
    latitude: 37.6624,
    longitude: -121.8747,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    // Robert Trent Jones II design - championship layout
    holes_data: [
      { number: 1, par: 4, yardage: 420, handicap: 11 },
      { number: 2, par: 5, yardage: 550, handicap: 3 },
      { number: 3, par: 3, yardage: 190, handicap: 15 },
      { number: 4, par: 4, yardage: 465, handicap: 1 },
      { number: 5, par: 4, yardage: 385, handicap: 9 },
      { number: 6, par: 3, yardage: 175, handicap: 17 },
      { number: 7, par: 5, yardage: 585, handicap: 5 },
      { number: 8, par: 4, yardage: 440, handicap: 7 },
      { number: 9, par: 4, yardage: 410, handicap: 13 },
      { number: 10, par: 4, yardage: 455, handicap: 2 },
      { number: 11, par: 3, yardage: 205, handicap: 16 },
      { number: 12, par: 5, yardage: 525, handicap: 6 },
      { number: 13, par: 4, yardage: 395, handicap: 12 },
      { number: 14, par: 3, yardage: 160, handicap: 18 },
      { number: 15, par: 4, yardage: 475, handicap: 4 },
      { number: 16, par: 5, yardage: 565, handicap: 8 },
      { number: 17, par: 3, yardage: 185, handicap: 14 },
      { number: 18, par: 4, yardage: 450, handicap: 10 }
    ]
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
