
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    date: Date | undefined;
    time: string;
    maxPlayers: number;
    description: string;
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
  teams: Array<{
    id: string;
    name: string;
    players: string[];
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
  const [tournamentData, setTournamentData] = useState<TournamentData>({
    basicInfo: {
      name: '',
      date: undefined,
      time: '',
      maxPlayers: 16,
      description: ''
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
    teams: [],
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
    { title: 'Teams & Players', component: TeamOrganizationStep },
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

  const handleCreateTournament = () => {
    console.log('Creating tournament with data:', tournamentData);
    // Here you would typically save to database/backend
    onClose();
  };

  const CurrentStepComponent = steps[currentStep].component;

  console.log('Rendering modal with isOpen:', isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Tournament</DialogTitle>
          <DialogDescription>
            Set up a new golf tournament with customizable rules, teams, and wagering options.
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                index <= currentStep ? 'text-emerald-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] mb-6">
          <CurrentStepComponent
            data={tournamentData}
            onDataChange={handleStepData}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleCreateTournament} className="bg-emerald-600 hover:bg-emerald-700">
              Create Tournament
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTournamentModal;
