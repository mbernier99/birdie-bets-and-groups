
import React, { useState, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTournaments } from '@/hooks/useTournaments';
import { validateStep } from '../utils/tournamentValidation';
import BasicInfoStep from './tournament-creation/BasicInfoStep';
import CourseSetupStep from './tournament-creation/CourseSetupStep';
import GameTypeStep from './tournament-creation/GameTypeStep';
import TeamOrganizationStep from './tournament-creation/TeamOrganizationStep';
import ReviewStep from './tournament-creation/ReviewStep';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TournamentData {
  basicInfo: {
    name: string;
    maxPlayers: number;
    groupId?: string;
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
    rules: Record<string, any>;
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
    nassauBets?: {
      front9: number;
      back9: number;
      overall: number;
    };
  };
  sideBets: {
    enabled: boolean;
  };
  adminBetting?: {
    liveEnabled: boolean;
    maxBetAmount: number;
    livePermissions: {
      initiators: 'all-players' | 'admin-only' | 'verified-only';
      settlement: 'auto' | 'admin-review' | 'gps-verified';
    };
    sidePools: {
      longestDrive?: {
        enabled: boolean;
        entryFee: number;
        holes: string;
      };
      closestToPin?: {
        enabled: boolean;
        entryFee: number;
        holes: string;
      };
      mostBirdies?: {
        enabled: boolean;
        entryFee: number;
      };
    };
  };
}

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = memo(({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Standard par pattern for 18 holes (par 72)
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

  // Simplified to 5 essential steps
  const steps = [
    { title: 'Basic Info', component: BasicInfoStep },
    { title: 'Course Setup', component: CourseSetupStep },
    { title: 'Game Type', component: GameTypeStep },
    { title: 'Players & Teams', component: TeamOrganizationStep },
    { title: 'Review', component: ReviewStep }
  ];

  const handleNext = () => {
    
    // Validate current step
    const validation = validateStep(currentStep, tournamentData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: "Please complete required fields",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }
    
    // Clear validation errors and proceed
    setValidationErrors([]);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setValidationErrors([]);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepKey: keyof TournamentData, data: any) => {
    setTournamentData(prev => ({
      ...prev,
      [stepKey]: data
    }));
  };

  const { createTournamentWithInvitations } = useTournaments();

  const handleSaveTournament = async () => {
    
    try {
      // Extract players with valid emails for invitations
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
          teeTimeGroups: tournamentData.teeTimeGroups,
          pairings: tournamentData.pairings,
          wagering: tournamentData.wagering
        }
      }, playersToInvite);
      
      onClose();
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const mapGameTypeToDatabase = (gameType: string): 'stroke' | 'match' | 'team_match' | 'skins' | 'stableford' => {
    switch (gameType.toLowerCase()) {
      case 'stroke play':
      case 'stroke':
        return 'stroke';
      case 'match play':
      case 'match':
        return 'match';
      case 'team match play':
      case 'team_match':
        return 'team_match';
      case 'skins':
        return 'skins';
      case 'stableford':
        return 'stableford';
      default:
        return 'stroke';
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  const StepProgress = () => {
    if (isMobile) {
      return (
        <div className="flex-shrink-0 px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, index) => {
            const validation = validateStep(index, tournamentData);
            const isCompleted = index < currentStep || (index <= currentStep && validation.isValid);
            
            return (
              <div key={index} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted ? 'bg-primary text-primary-foreground' : 
                  index === currentStep ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm truncate ${
                  isCompleted ? 'text-primary' : 
                  index === currentStep ? 'text-primary' :
                  'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const NavigationButtons = () => {
    const currentStepValidation = validateStep(currentStep, tournamentData);
    const canProceed = currentStepValidation.isValid;
    
    return (
      <div className="flex-shrink-0 p-4 border-t bg-white">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <div className="font-medium mb-1">Please complete the following:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
            size={isMobile ? "sm" : "default"}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>


          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 ${
                canProceed 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              size={isMobile ? "sm" : "default"}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSaveTournament}
              className="bg-emerald-600 hover:bg-emerald-700"
              size={isMobile ? "sm" : "default"}
            >
              Create Tournament
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[95vh] flex flex-col p-0">
          <StepProgress />

          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <CurrentStepComponent
              data={tournamentData}
              onDataChange={handleStepData}
              {...(currentStep === steps.length - 1 && { onSaveTournament: handleSaveTournament })}
            />
          </div>

          <NavigationButtons />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <StepProgress />

        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          <CurrentStepComponent
            data={tournamentData}
            onDataChange={handleStepData}
            {...(currentStep === steps.length - 1 && { onSaveTournament: handleSaveTournament })}
          />
        </div>

        <NavigationButtons />
      </DialogContent>
    </Dialog>
  );
});

export default CreateTournamentModal;
