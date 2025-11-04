import React, { useState, memo, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/contexts/AuthContext';
import InvitePlayersStep from './tournament-creation/InvitePlayersStep';
import GameSettingsStep from './tournament-creation/GameSettingsStep';
import TeamOrganizationStep from './tournament-creation/TeamOrganizationStep';
import BetsStep from './tournament-creation/BetsStep';
import ReviewStep from './tournament-creation/ReviewStep';
import { InlineAuthSheet } from './tournament-creation/InlineAuthSheet';

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

const STORAGE_KEY = 'tournament_draft';

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = memo(({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const standardPars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4];

  const getDefaultData = (): TournamentData => ({
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

  const mergeWithDefaults = (saved: Partial<TournamentData>): TournamentData => {
    const defaults = getDefaultData();
    return {
      basicInfo: { ...defaults.basicInfo, ...(saved.basicInfo || {}) },
      course: {
        ...defaults.course,
        ...(saved.course || {}),
        holes: Array.isArray(saved.course?.holes) 
          ? saved.course.holes.map(h => ({
              number: h.number ?? 1,
              par: h.par ?? 4,
              yardage: h.yardage ?? 350,
              handicapIndex: h.handicapIndex ?? 1,
            })) 
          : defaults.course.holes,
      },
      gameType: {
        ...defaults.gameType,
        ...(saved.gameType || {}),
        rules: { ...defaults.gameType.rules, ...(saved.gameType?.rules || {}) },
      },
      players: saved.players ?? [],
      teams: saved.teams ?? [],
      teeTimeGroups: saved.teeTimeGroups ?? [],
      pairings: saved.pairings ?? [],
      wagering: { 
        ...defaults.wagering, 
        ...(saved.wagering || {}),
        payoutStructure: saved.wagering?.payoutStructure || defaults.wagering.payoutStructure
      },
      sideBets: { ...defaults.sideBets, ...(saved.sideBets || {}) },
      adminBetting: {
        ...defaults.adminBetting,
        ...(saved.adminBetting || {}),
        livePermissions: {
          ...defaults.adminBetting!.livePermissions,
          ...(saved.adminBetting?.livePermissions || {}),
        },
        sidePools: saved.adminBetting?.sidePools || {},
      },
    };
  };

  const [tournamentData, setTournamentData] = useState<TournamentData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultData();
    
    try {
      const parsed = JSON.parse(saved);
      return mergeWithDefaults(parsed);
    } catch (e) {
      console.error('Failed to parse saved tournament data', e);
      return getDefaultData();
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (tournamentData.basicInfo.name || tournamentData.players.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tournamentData));
    }
  }, [tournamentData]);

  const steps = [
    { title: 'Add Players' },
    { title: 'Course & Game' },
    { title: 'Organization' },
    { title: 'Wagering' },
    { title: 'Tournament Review' },
  ];

  const handleNext = () => {
    if (!canProceed()) {
      if (currentStep === 0 && tournamentData.players.length < 2) {
        toast({
          title: "Add at least 2 players to continue",
          variant: "destructive"
        });
      } else if (currentStep === 3 && tournamentData.wagering.entryFee > 0) {
        const totalPercentage = (tournamentData.wagering.firstPlacePercentage || 100) + 
          (tournamentData.wagering.secondPlaceEnabled ? (tournamentData.wagering.secondPlacePercentage || 0) : 0) +
          (tournamentData.wagering.thirdPlaceEnabled ? (tournamentData.wagering.thirdPlacePercentage || 0) : 0);
        toast({
          title: "Prize distribution must total 100%",
          description: `Current total: ${Math.round(totalPercentage)}%`,
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

    // Normalize wagering data when leaving the wagering step
    if (currentStep === 3 && tournamentData.wagering.entryFee === 0) {
      handleDataChange('wagering', {
        ...tournamentData.wagering,
        payoutStructure: tournamentData.wagering.payoutStructure || 'winner-takes-all',
        firstPlacePercentage: undefined,
        secondPlaceEnabled: false,
        secondPlacePercentage: undefined,
        thirdPlaceEnabled: false,
        thirdPlacePercentage: undefined,
      });
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

  const handleCreateClick = () => {
    if (!user) {
      setShowAuthSheet(true);
      return;
    }
    handleCreate();
  };

  const handleAuthSuccess = () => {
    setShowAuthSheet(false);
    // Small delay to ensure auth state is updated
    setTimeout(() => {
      handleCreate();
    }, 500);
  };

  const handleCreate = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      const playersToInvite = tournamentData.players
        .filter(p => typeof p.name === 'string' && p.name.trim().length > 0)
        .filter(p => typeof p.email === 'string' && p.email.trim().length > 0)
        .map(p => ({
          name: p.name.trim(),
          email: p.email.trim(),
          handicapIndex: Number.isFinite(p.handicapIndex) ? p.handicapIndex : 0
        }));

      // Sanitize wagering data
      const sanitizedWagering = { ...tournamentData.wagering };
      if (sanitizedWagering.entryFee === 0) {
        delete sanitizedWagering.firstPlacePercentage;
        delete sanitizedWagering.secondPlacePercentage;
        delete sanitizedWagering.thirdPlacePercentage;
        sanitizedWagering.secondPlaceEnabled = false;
        sanitizedWagering.thirdPlaceEnabled = false;
      }
      // Strip undefined values from wagering
      const cleanWagering = JSON.parse(JSON.stringify(sanitizedWagering));

      const tournament = await createTournamentWithInvitations({
        name: tournamentData.basicInfo.name,
        description: `${tournamentData.gameType.type} tournament`,
        status: 'lobby',
        game_type: mapGameTypeToDatabase(tournamentData.gameType.type),
        entry_fee: tournamentData.wagering.entryFee,
        prize_pool: tournamentData.wagering.entryFee * tournamentData.players.length,
        max_players: tournamentData.basicInfo.maxPlayers,
        rules: tournamentData.gameType.rules,
        settings: JSON.parse(JSON.stringify({
          course: tournamentData.course,
          teams: tournamentData.teams,
          teeTimeGroups: tournamentData.teeTimeGroups,
          pairings: tournamentData.pairings,
          wagering: cleanWagering
        }))
      }, playersToInvite);

      toast({
        title: "Tournament created!",
        description: "Opening tournament lobby..."
      });

      // Clear localStorage draft
      localStorage.removeItem(STORAGE_KEY);

      onClose();
      setCurrentStep(0);
      
      // Navigate to tournament lobby
      navigate(`/tournament/${tournament.id}/lobby`);
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error creating tournament",
        description: (error as any)?.message || (error as any)?.details || 'Something went wrong. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
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
      case 0: // Add Players
        return tournamentData.basicInfo.name.trim() && tournamentData.players.length >= 2;
      case 1: // Course & Game
        return tournamentData.course.name.trim() && tournamentData.gameType.type;
      case 2: // Organization - optional, can always proceed
        return true;
      case 3: // Wagering
        // Validate prize distribution percentages if entry fee is set
        if (tournamentData.wagering.entryFee > 0) {
          const totalPercentage = (tournamentData.wagering.firstPlacePercentage || 100) + 
            (tournamentData.wagering.secondPlaceEnabled ? (tournamentData.wagering.secondPlacePercentage || 0) : 0) +
            (tournamentData.wagering.thirdPlaceEnabled ? (tournamentData.wagering.thirdPlacePercentage || 0) : 0);
          return Math.round(totalPercentage) === 100;
        }
        return true;
      case 4: // Review & Invite
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
        return <TeamOrganizationStep data={tournamentData} onDataChange={handleDataChange} />;
      case 3:
        return <BetsStep data={tournamentData} onDataChange={handleDataChange} />;
      case 4:
        return <ReviewStep data={tournamentData} onDataChange={handleDataChange} onSaveTournament={handleCreateClick} />;
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
          {currentStep !== 0 && currentStep !== 4 && (
            <Button 
              onClick={handleNext}
              disabled={!canProceed() || isCreating}
              size="lg"
              className="w-full h-14 text-lg font-semibold"
            >
              Next
            </Button>
          )}
        </div>
      </DialogContent>

      <InlineAuthSheet 
        isOpen={showAuthSheet}
        onClose={() => setShowAuthSheet(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </Dialog>
  );
});

export default CreateTournamentModal;
