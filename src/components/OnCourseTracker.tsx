
import React, { useState, useEffect } from 'react';
import { MapPin, Calculator } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMobileFeatures } from '../hooks/useMobileFeatures';
import { useShots } from '../hooks/useShots';
import PressManager from './press/PressManager';
import PressLedger from './press/PressLedger';
import ScoreEntry from './ScoreEntry';
import ShotTracker from './ShotTracker';
import ShotHistory from './ShotHistory';
import { Press } from '../types/press';

const OnCourseTracker = () => {
  const {
    location,
    isLocationEnabled,
    isMobile,
    saveToStorage,
    getFromStorage
  } = useMobileFeatures();

  const { shots, recordShot, recordShotWithPhoto, calculateDistance } = useShots();

  const [currentHole, setCurrentHole] = useState(1);
  const [presses, setPresses] = useState<Press[]>([]);

  // Mock tournament and player data - replace with actual data
  const currentUserId = 'user-1';
  const tournamentId = 'tournament-1';
  const players = [
    { id: 'user-1', name: 'You', currentHole: currentHole },
    { id: 'user-2', name: 'John Smith', currentHole: currentHole },
    { id: 'user-3', name: 'Mike Johnson', currentHole: currentHole - 1 },
    { id: 'user-4', name: 'Dave Wilson', currentHole: currentHole + 1 }
  ];

  useEffect(() => {
    loadSavedPresses();
  }, []);

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
    recordShot(currentHole);
  };

  const handleRecordShotWithPhoto = () => {
    recordShotWithPhoto(currentHole);
  };

  if (!isMobile) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">On-course tracking is available in the mobile app</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <Tabs defaultValue="score" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="score">Score</TabsTrigger>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="press">Press</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="score" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Score Entry</h2>
            <Calculator className="h-6 w-6 text-emerald-600" />
          </div>
          <ScoreEntry 
            playerId={currentUserId}
            playerName="You"
            onScoreChange={(scores) => {
              console.log('Scores updated:', scores);
              // Future: Sync with tournament/match play system
            }}
            onRoundComplete={(finalScores) => {
              console.log('Round completed:', finalScores);
              // Future: Submit to tournament system
            }}
          />
        </TabsContent>

        <TabsContent value="tracker" className="p-6">
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

        <TabsContent value="ledger" className="p-6">
          <PressLedger
            presses={presses}
            currentUserId={currentUserId}
            players={players}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnCourseTracker;
