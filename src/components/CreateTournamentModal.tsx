
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BasicInfoStep from './tournament-creation/BasicInfoStep';
import CourseSetupStep from './tournament-creation/CourseSetupStep';
import GameTypeStep from './tournament-creation/GameTypeStep';
import TeamOrganizationStep from './tournament-creation/TeamOrganizationStep';
import WageringStep from './tournament-creation/WageringStep';
import SideBetsStep from './tournament-creation/SideBetsStep';
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
    handicap?: number;
    invited: boolean;
  }>;
  teams: Array<{
    id: string;
    name: string;
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
  };
  sideBets: Array<{
    id: string;
    type: string;
    amount: number;
    holes: number[];
    participants: string[];
  }>;
}

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({ isOpen, onClose }) => {
  console.log('CreateTournamentModal rendered with props:', { isOpen, onClose });

  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
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
        par: 4,
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
    pairings: [],
    wagering: {
      entryFee: 0,
      payoutStructure: 'winner-takes-all',
      currency: 'USD'
    },
    sideBets: []
  });

  const steps = [
    { title: 'Basic Info', component: BasicInfoStep },
    { title: 'Course Setup', component: CourseSetupStep },
    { title: 'Game Type', component: GameTypeStep },
    { title: 'Players & Teams', component: TeamOrganizationStep },
    { title: 'Wagering', component: WageringStep },
    { title: 'Side Bets', component: SideBetsStep },
    { title: 'Review', component: ReviewStep }
  ];

  const handleNext = () => {
    console.log('Next button clicked, current step:', currentStep);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    console.log('Previous button clicked, current step:', currentStep);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepKey: keyof TournamentData, data: any) => {
    console.log('Step data updated:', stepKey, data);
    setTournamentData(prev => ({
      ...prev,
      [stepKey]: data
    }));
  };

  const handleSaveTournament = () => {
    console.log('Saving tournament with data:', tournamentData);
    
    // Save tournament to localStorage for now (later this would be saved to database)
    const savedTournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    const newTournament = {
      id: Date.now().toString(),
      ...tournamentData,
      status: 'created',
      createdAt: new Date().toISOString()
    };
    
    savedTournaments.push(newTournament);
    localStorage.setItem('savedTournaments', JSON.stringify(savedTournaments));
    
    toast({
      title: "Tournament Saved!",
      description: "Your tournament has been saved successfully. You can now start it from your homepage.",
    });
    
    onClose();
  };

  const CurrentStepComponent = steps[currentStep].component;

  console.log('Rendering modal with isOpen:', isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <DialogTitle className="text-lg">Create Tournament</DialogTitle>
            <DialogDescription className="text-sm">
              Set up a new golf tournament with customizable rules, teams, and wagering options.
            </DialogDescription>
          </DialogHeader>

          {/* Step Progress - Mobile Optimized */}
          <div className="px-4 py-3 border-b bg-gray-50 shrink-0">
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center min-w-0 flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    index <= currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-1 sm:ml-2 text-xs sm:text-sm truncate max-w-20 sm:max-w-none ${
                    index <= currentStep ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-4 sm:w-8 h-0.5 mx-2 sm:mx-4 ${
                      index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <CurrentStepComponent
              data={tournamentData}
              onDataChange={handleStepData}
              {...(currentStep === steps.length - 1 && { onSaveTournament: handleSaveTournament })}
            />
          </div>

          {/* Navigation - Fixed at bottom */}
          <div className="flex justify-between p-4 border-t bg-white shrink-0">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-1 sm:space-x-2"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {currentStep < steps.length - 1 && (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-1 sm:space-x-2 bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTournamentModal;
