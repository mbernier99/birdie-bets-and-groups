import React, { useState, memo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/contexts/AuthContext';
import InvitePlayersStep from './tournament-creation/InvitePlayersStep';
import GameSettingsStep from './tournament-creation/GameSettingsStep';
import BetsStep from './tournament-creation/BetsStep';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TournamentData {
  basicInfo: {
    name: string;
    maxPlayers: number;
  };
  course: {
    name: string;
    teeBox: string;
    holes: Array<{
      number: number;
      par: number;
      yardage: number;
      handicapIndex: number;
    }>;
    rating: number;
    slope: number;
    id?: string;
    location?: string;
    par?: number;
    availableTees?: any[];
    mensTee?: string;
    mensRating?: number;
    mensSlope?: number;
    womensTee?: string;
    womensRating?: number;
    womensSlope?: number;
  };
  gameType: {
    type: string;
    format?: 'individual' | 'team';
    rules: {
      teamSize?: number;
      scoresCounted?: number;
      handicapPercentage?: number;
      indexOnLow?: boolean;
      automaticPress?: boolean;
      pressDownBy?: number;
      closeout?: boolean;
      [key: string]: any;
    };
  };
  players: Array<{
    id: string;
    name: string;
    email: string;
    handicapIndex: number;
    status: 'invited' | 'accepted' | 'declined';
  }>;
  teams: Array<{
    id: string;
    name: string;
    playerIds: string[];
  }>;
  teeTimeGroups: Array<{
    id: string;
    time: string;
    playerIds: string[];
  }>;
  pairings: Array<{
    id: string;
    name: string;
    playerIds: string[];
    teeTime?: string;
  }>;
  wagering: {
    entryFee: number;
    payoutStructure: string;
    currency: string;
    skinValue?: number;
    firstPlacePercentage?: number;
    secondPlaceEnabled?: boolean;
    secondPlacePercentage?: number;
    thirdPlaceEnabled?: boolean;
    thirdPlacePercentage?: number;
  };
  sideBets: {
    enabled: boolean;
  };
  adminBetting?: {
    liveEnabled: boolean;
    maxBetAmount: number;
    livePermissions: {
      initiators: string;
      settlement: string;
    };
    sidePools: Record<string, any>;
  };
}

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = memo(({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const standardPars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4];

  const [tournamentData, setTournamentData] = useState<TournamentData>({
    basicInfo: {
      name: '',
      maxPlayers: 16
    },
    course: {
      name: '',
      teeBox: 'white',
      holes: Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        par: standardPars[i],
        yardage: 400,
        handicapIndex: i + 1
      })),
      rating: 72.0,
      slope: 113
    },
    gameType: {
      type: '',
      format: 'individual',
      rules: {}
    },
    players: [],
    teams: [],
    teeTimeGroups: [],
    pairings: [],
    wagering: {
      entryFee: 0,
      payoutStructure: 'winner-takes-all',
      currency: 'USD'
    },
    sideBets: {
      enabled: false
    },
    adminBetting: {
      liveEnabled: false,
      maxBetAmount: 100,
      livePermissions: {
        initiators: 'all-players',
        settlement: 'auto'
      },
      sidePools: {}
    }
  });

  const steps = [
    { title: 'Invite Players' },
    { title: 'Game Settings' },
    { title: 'Bets' },
  ];

  const handleNext = () => {
    if (!canProceed()) {
      if (currentStep === 0 && tournamentData.players.length < 2) {
        toast({
          title: "Add at least 2 players to continue",
          variant: "destructive"
        });
      } else if (currentStep === 2 && tournamentData.wagering.entryFee > 0) {
        const totalPercentage = (tournamentData.wagering.firstPlacePercentage || 100) + 
          (tournamentData.wagering.secondPlaceEnabled ? (tournamentData.wagering.secondPlacePercentage || 0) : 0) +
          (tournamentData.wagering.thirdPlaceEnabled ? (tournamentData.wagering.thirdPlacePercentage || 0) : 0);
        toast({
          title: "Prize distribution must total 100%",
          description: `Current total: ${totalPercentage}%`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Please complete required fields",
          variant: "destructive"
        });
      }
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataChange = (key: keyof TournamentData, data: any) => {
    setTournamentData(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const { createTournamentWithInvitations } = useTournaments();

  const handleCreate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a tournament",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      const playersToInvite = tournamentData.players
        .filter(p => p.name.trim() && p.email.trim())
        .map(p => ({
          name: p.name,
          email: p.email,
          handicapIndex: p.handicapIndex
        }));

      const tournament = await createTournamentWithInvitations({
        name: tournamentData.basicInfo.name,
        description: `${tournamentData.gameType.type} tournament`,
        status: 'lobby',
        game_type: mapGameTypeToDatabase(tournamentData.gameType.type),
        entry_fee: tournamentData.wagering.entryFee,
        prize_pool: tournamentData.wagering.entryFee * tournamentData.basicInfo.maxPlayers,
        max_players: tournamentData.basicInfo.maxPlayers,
        rules: tournamentData.gameType.rules,
        settings: {
          course: tournamentData.course,
          teams: tournamentData.teams,
          wagering: tournamentData.wagering
        }
      }, playersToInvite);

      toast({
        title: "Tournament created!",
        description: "Opening tournament lobby..."
      });

      onClose();
      setCurrentStep(0);
      
      // Navigate to tournament lobby
      navigate(`/tournament/${tournament.id}/lobby`);
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error creating tournament",
        variant: "destructive"
      });
    }
  };

  const mapGameTypeToDatabase = (gameType: string): 'stroke' | 'match' | 'team_match' | 'skins' | 'stableford' => {
    const lowerType = gameType.toLowerCase();
    if (lowerType.includes('stroke')) return 'stroke';
    if (lowerType.includes('match')) return 'match';
    if (lowerType.includes('skins')) return 'skins';
    if (lowerType.includes('stableford')) return 'stableford';
    return 'stroke';
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return tournamentData.basicInfo.name.trim() && tournamentData.players.length >= 2;
      case 1:
        return tournamentData.course.name.trim() && tournamentData.gameType.type;
      case 2:
        // Validate prize distribution percentages if entry fee is set
        if (tournamentData.wagering.entryFee > 0) {
          const totalPercentage = (tournamentData.wagering.firstPlacePercentage || 100) + 
            (tournamentData.wagering.secondPlaceEnabled ? (tournamentData.wagering.secondPlacePercentage || 0) : 0) +
            (tournamentData.wagering.thirdPlaceEnabled ? (tournamentData.wagering.thirdPlacePercentage || 0) : 0);
          return totalPercentage === 100;
        }
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <InvitePlayersStep data={tournamentData} onDataChange={handleDataChange} onNext={handleNext} />;
      case 1:
        return <GameSettingsStep data={tournamentData} onDataChange={handleDataChange} />;
      case 2:
        return <BetsStep data={tournamentData} onDataChange={handleDataChange} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <div className="relative flex items-center justify-center">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-0 p-2 hover:bg-accent rounded-lg transition-colors active:scale-95"
                aria-label="Go back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            <h2 className="text-2xl font-bold">
              {steps[currentStep]?.title || 'Create Tournament'}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {renderStep()}
        </div>

        <div className="flex-shrink-0 p-6 border-t space-y-3">
          {currentStep !== 0 && (
            <Button 
              onClick={currentStep < steps.length - 1 ? handleNext : handleCreate}
              disabled={!canProceed() || authLoading || (currentStep === steps.length - 1 && !user)}
              size="lg"
              className="w-full h-14 text-lg font-semibold"
            >
              {authLoading ? 'Loading...' : currentStep < steps.length - 1 ? 'Next' : 'Create Tournament'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default CreateTournamentModal;
