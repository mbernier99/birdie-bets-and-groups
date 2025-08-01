
import React, { useState, useEffect } from 'react';
import { MapPin, Calculator, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOptimizedGPS } from '../hooks/useOptimizedGPS';
import { useMobileFeatures } from '../hooks/useMobileFeatures';
import { useShots } from '../hooks/useShots';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { determineCurrentHole, getCoursePosition } from '../utils/gpsCalculations';
import PressManager from './press/PressManager';
import PressLedger from './press/PressLedger';
import LocationBasedBetModal from './press/LocationBasedBetModal';
import BetResolutionPanel from './press/BetResolutionPanel';
import ScoreEntry from './ScoreEntry';
import ShotTracker from './ShotTracker';
import ShotHistory from './ShotHistory';
import OfflineIndicator from './OfflineIndicator';
import { Press } from '../types/press';

const OnCourseTracker = () => {
  const { location, isLocationEnabled, getCurrentLocation, requestPermission } = useOptimizedGPS({ 
    accuracy: 'high', 
    mode: 'betting' 
  });
  const { takePhoto, saveToStorage, getFromStorage, isMobile } = useMobileFeatures();
  const [currentRoundId] = useState(() => crypto.randomUUID()); // Generate round ID for this session
  const { shots, recordShot, recordShotWithPhoto, calculateDistance } = useShots(currentRoundId);
  const { preloadCourseData, isOnline } = useOfflineStorage();

  const [currentHole, setCurrentHole] = useState(1);
  const [presses, setPresses] = useState<Press[]>([]);
  const [showLocationBetModal, setShowLocationBetModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; currentHole: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Mock tournament and player data - replace with actual data
  const currentUserId = 'user-1';
  const tournamentId = 'tournament-1';
  const players = [
    { id: 'user-1', name: 'You', currentHole: currentHole },
    { id: 'user-2', name: 'John Smith', currentHole: currentHole },
    { id: 'user-3', name: 'Mike Johnson', currentHole: currentHole - 1 },
    { id: 'user-4', name: 'Dave Wilson', currentHole: currentHole + 1 }
  ];

  // Mock course data with GPS coordinates
  const courseHoles = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: i % 3 === 0 ? 5 : i % 3 === 1 ? 4 : 3,
    yardage: 350 + (i * 10),
    handicapIndex: i + 1,
    teeLocation: {
      latitude: 40.7128 + (i * 0.001),
      longitude: -74.0060 + (i * 0.001)
    },
    pinLocation: {
      latitude: 40.7128 + (i * 0.001) + 0.0005,
      longitude: -74.0060 + (i * 0.001) + 0.0005
    }
  }));

  useEffect(() => {
    loadSavedPresses();
    
    // Auto-enable GPS when entering tracker mode
    const initializeGPS = async () => {
      if (isMobile && !isLocationEnabled) {
        const granted = await requestPermission();
        if (granted) {
          await getCurrentLocation();
          startGPSTracking();
        }
      } else if (isLocationEnabled && isMobile) {
        startGPSTracking();
      }
    };

    initializeGPS();

    return () => {
      if (watchId) {
        stopGPSTracking();
      }
    };
  }, [isMobile, isLocationEnabled, requestPermission, getCurrentLocation]);

  // Auto-detect current hole based on GPS location
  useEffect(() => {
    if (location && courseHoles.length > 0) {
      const detectedHole = determineCurrentHole(location, courseHoles);
      if (detectedHole && detectedHole !== currentHole) {
        console.log(`GPS detected hole change: ${currentHole} -> ${detectedHole}`);
        setCurrentHole(detectedHole);
      }
    }
  }, [location, courseHoles]);

  const startGPSTracking = () => {
    // GPS tracking is now handled automatically by the optimized hook
    setWatchId(1); // Just set a dummy ID to indicate tracking is active
  };

  const stopGPSTracking = () => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const loadSavedPresses = async () => {
    const savedPresses = await getFromStorage('golf-presses');
    if (savedPresses) {
      setPresses(savedPresses);
    }
  };

  const savePresses = async (newPresses: Press[]) => {
    await saveToStorage('golf-presses', newPresses);
    setPresses(newPresses);
  };

  const handleRecordShot = () => {
    recordShot(currentHole, { shotNumber: shots.filter(s => s.hole === currentHole).length + 1 });
  };

  const handleRecordShotWithPhoto = () => {
    recordShotWithPhoto(currentHole, { shotNumber: shots.filter(s => s.hole === currentHole).length + 1 });
  };

  const handleLocationBasedPress = (player: { id: string; name: string; currentHole: number }) => {
    setSelectedPlayer(player);
    setShowLocationBetModal(true);
  };

  const handleSubmitLocationBet = (request: any) => {
    const newPress: Press = {
      id: Date.now().toString(),
      tournamentId,
      initiatorId: currentUserId,
      targetId: request.targetId,
      amount: request.amount,
      currency: 'USD',
      startHole: request.startHole,
      gameType: request.gameType,
      winCondition: request.winCondition,
      status: 'pending',
      initiatedAt: Date.now(),
      isCounter: false,
      expiresAt: Date.now() + 60000,
      requiresGPS: request.requiresGPS,
      targetLocation: request.targetLocation,
      participantShots: []
    };

    const updatedPresses = [...presses, newPress];
    savePresses(updatedPresses);
    setShowLocationBetModal(false);
  };

  const handleResolveBet = (pressId: string, winner: string, measurements: any[]) => {
    const updatedPresses = presses.map(press => 
      press.id === pressId
        ? {
            ...press,
            status: 'completed' as const,
            winner,
            completedAt: Date.now()
          }
        : press
    );
    savePresses(updatedPresses);
  };

  const handleDisputeBet = (pressId: string, reason: string) => {
    console.log(`Bet ${pressId} disputed: ${reason}`);
    // In a real app, this would trigger a dispute resolution process
  };

  // Get current course position for display
  const currentPosition = location ? getCoursePosition(location, currentHole, courseHoles) : null;

  if (!isMobile) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">On-course tracking is available in the mobile app</p>
      </div>
    );
  }

  // Find location-based presses that need resolution
  const locationBasedPresses = presses.filter(press => 
    press.requiresGPS && 
    press.status === 'active' &&
    (press.initiatorId === currentUserId || press.targetId === currentUserId)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Offline indicator */}
      <OfflineIndicator />
      
      <Tabs defaultValue="score" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="score">Score</TabsTrigger>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="press">Press</TabsTrigger>
          <TabsTrigger value="location" className="relative">
            GPS Bets
            {location && isLocationEnabled && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="score" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Score Entry</h2>
            <Calculator className="h-6 w-6 text-emerald-600" />
          </div>
          
          {/* GPS Position Display */}
          {currentPosition && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Hole {currentHole}</span>
                  <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                    {currentPosition.area}
                  </span>
                </div>
                {currentPosition.distanceToPin && (
                  <span className="text-xs text-emerald-600">
                    {currentPosition.distanceToPin.toFixed(0)}m to pin
                  </span>
                )}
              </div>
            </div>
          )}

          <ScoreEntry 
            playerId={currentUserId}
            playerName="You"
            onScoreChange={(scores) => {
              console.log('Scores updated:', scores);
            }}
            onRoundComplete={(finalScores) => {
              console.log('Round completed:', finalScores);
            }}
          />
        </TabsContent>

        <TabsContent value="tracker" className="p-6">
          {/* GPS Status and Quick Bet Access */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className={`h-5 w-5 ${isLocationEnabled ? 'text-emerald-600' : 'text-red-500'}`} />
                <span className={`font-medium ${isLocationEnabled ? 'text-emerald-800' : 'text-red-800'}`}>
                  {isLocationEnabled ? 'GPS Active' : 'GPS Disabled'}
                </span>
                {location && (
                  <span className="text-sm text-emerald-600">
                    Accuracy: {location.accuracy.toFixed(0)}m
                  </span>
                )}
              </div>
              {!isLocationEnabled && (
                <button
                  onClick={requestPermission}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                >
                  Enable GPS
                </button>
              )}
            </div>

            {/* Quick Bet Initiation */}
            {isLocationEnabled && location && (
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-2">Ready to Bet!</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Your GPS is active. Challenge players with location-based bets.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {players
                    .filter(player => player.id !== currentUserId)
                    .slice(0, 2)
                    .map(player => (
                      <button
                        key={player.id}
                        onClick={() => handleLocationBasedPress(player)}
                        className="px-3 py-2 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 flex items-center justify-center space-x-1"
                      >
                        <Target className="h-4 w-4" />
                        <span>vs {player.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <ShotTracker
            currentHole={currentHole}
            onRecordShot={handleRecordShot}
            onRecordShotWithPhoto={handleRecordShotWithPhoto}
            isLocationEnabled={isLocationEnabled}
            location={location}
          />
          
          <ShotHistory
            shots={shots}
            currentHole={currentHole}
            calculateDistance={calculateDistance}
          />
        </TabsContent>

        <TabsContent value="press" className="p-6">
          <PressManager
            tournamentId={tournamentId}
            currentUserId={currentUserId}
            currentHole={currentHole}
            players={players}
          />
        </TabsContent>

        <TabsContent value="location" className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">GPS-Based Betting</h2>
              <Target className="h-6 w-6 text-emerald-600" />
            </div>

            {/* Current Position */}
            {currentPosition && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Current Position</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hole {currentHole} - {currentPosition.area}</span>
                  {currentPosition.distanceToPin && (
                    <span className="text-sm text-gray-600">
                      {currentPosition.distanceToPin.toFixed(0)}m to pin
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Available Players for Location Bets */}
            <div className="space-y-2">
              <h3 className="font-medium">Challenge Players</h3>
              {players
                .filter(player => player.id !== currentUserId)
                .map(player => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-gray-600 ml-2">Hole {player.currentHole}</span>
                    </div>
                    <button
                      onClick={() => handleLocationBasedPress(player)}
                      disabled={!location || !isLocationEnabled}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:bg-gray-400"
                    >
                      GPS Bet
                    </button>
                  </div>
                ))}
            </div>

            {/* Active Location-Based Bets */}
            {locationBasedPresses.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Active GPS Bets</h3>
                {locationBasedPresses.map(press => (
                  <BetResolutionPanel
                    key={press.id}
                    press={press}
                    players={players}
                    onResolve={handleResolveBet}
                    onDispute={handleDisputeBet}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="p-6">
          <PressLedger
            presses={presses}
            currentUserId={currentUserId}
            players={players}
          />
        </TabsContent>
      </Tabs>

      <LocationBasedBetModal
        isOpen={showLocationBetModal}
        onClose={() => setShowLocationBetModal(false)}
        targetPlayer={selectedPlayer}
        currentHole={currentHole}
        currentLocation={location}
        courseHoles={courseHoles}
        onSubmit={handleSubmitLocationBet}
      />
    </div>
  );
};

export default OnCourseTracker;
