import React, { useState, memo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
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
      toast({
        title: "Please complete required fields",
        variant: "destructive"
      });
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
    try {
      const playersToInvite = tournamentData.players
        .filter(p => p.name.trim() && p.email.trim())
        .map(p => ({
          name: p.name,
          email: p.email,
          handicapIndex: p.handicapIndex
        }));

      await createTournamentWithInvitations({
        name: tournamentData.basicInfo.name,
        description: `${tournamentData.gameType.type} tournament`,
        status: 'draft',
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
        description: "Players will receive their invitations"
      });

      onClose();
      setCurrentStep(0);
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
        return tournamentData.basicInfo.name.trim() && tournamentData.players.length > 0;
      case 1:
        return tournamentData.course.name.trim() && tournamentData.gameType.type;
      case 2:
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
          <h2 className="text-2xl font-bold text-center">
            {steps[currentStep]?.title || 'Create Tournament'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {renderStep()}
        </div>

        <div className="flex-shrink-0 p-6 border-t space-y-3">
          {currentStep !== 0 && (
            <>
              <Button 
                onClick={currentStep < steps.length - 1 ? handleNext : handleCreate}
                disabled={!canProceed()}
                size="lg"
                className="w-full h-14 text-lg font-semibold"
              >
                {currentStep < steps.length - 1 ? 'Next' : 'Create Tournament'}
              </Button>

              {currentStep > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={handlePrevious}
                  size="lg"
                  className="w-full h-12"
                >
                  Back
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default CreateTournamentModal;
