import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
import MobileQuickSetupStep from './MobileQuickSetupStep';
import MobileCourseGameStep from './MobileCourseGameStep';
import MobileAdminBettingStep from './MobileAdminBettingStep';
import MobileOrganizationStep from './MobileOrganizationStep';
import MobileGoLiveStep from './MobileGoLiveStep';
import { TournamentData } from '../CreateTournamentModal';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MobileTournamentSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileTournamentSheet: React.FC<MobileTournamentSheetProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { createTournament } = useTournaments();
  const { triggerImpact, triggerNotification } = useHapticFeedback();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tournamentData, setTournamentData] = useState<TournamentData>({
    basicInfo: {
      name: '',
      maxPlayers: 4,
    },
    course: {
      name: '',
      teeBox: 'white',
      rating: 72.0,
      slope: 113,
      holes: Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        par: 4,
        yardage: 350,
        handicapIndex: i + 1,
      })),
    },
    gameType: {
      type: '',
      format: 'individual',
      rules: {},
    },
    players: [],
    teams: [],
    teeTimeGroups: [],
    pairings: [],
    wagering: {
      entryFee: 0,
      payoutStructure: 'winner-take-all',
      currency: 'USD',
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
    { title: 'Quick Setup', needsOrganization: false },
    { title: 'Organization', needsOrganization: true },
    { title: 'Go Live', needsOrganization: false },
  ];

  const handleDataChange = (key: keyof TournamentData, value: any) => {
    setTournamentData(prev => ({ ...prev, [key]: value }));
  };

  const needsOrganization = () => {
    const teamGameTypes = ['scramble', 'bestBall', 'alternateShot', 'fourball', 'chapman'];
    return teamGameTypes.includes(tournamentData.gameType.type) && tournamentData.players.length > 1;
  };

  const handleNext = () => {
    triggerImpact('light');
    
    // Validation for step 0 (Quick Setup)
    if (currentStep === 0) {
      if (!tournamentData.basicInfo.name.trim()) {
        toast({
          title: 'Tournament name required',
          description: 'Please enter a name for your tournament',
          variant: 'destructive',
        });
        triggerNotification('error');
        return;
      }
      if (tournamentData.players.length === 0) {
        toast({
          title: 'Players required',
          description: 'Please add at least one player',
          variant: 'destructive',
        });
        triggerNotification('error');
        return;
      }
    }

    // Validation for step 1 (Course & Game)
    if (currentStep === 1) {
      if (!tournamentData.course.name.trim()) {
        toast({
          title: 'Course required',
          description: 'Please select a course',
          variant: 'destructive',
        });
        triggerNotification('error');
        return;
      }
      if (!tournamentData.gameType.type) {
        toast({
          title: 'Game type required',
          description: 'Please select a game format',
          variant: 'destructive',
        });
        triggerNotification('error');
        return;
      }
    }

    // Skip organization step if not needed
    const isTeamGame = ['best-ball', 'scramble', 'team-match-play'].includes(tournamentData.gameType.type);
    const needsOrg = isTeamGame && tournamentData.players.length > 1;
    
    if (currentStep === 2 && !needsOrg) {
      setCurrentStep(4); // Skip to review
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    triggerImpact('light');
    
    // Skip organization step when going back if not needed
    const isTeamGame = ['best-ball', 'scramble', 'team-match-play'].includes(tournamentData.gameType.type);
    const needsOrg = isTeamGame && tournamentData.players.length > 1;
    
    if (currentStep === 4 && !needsOrg) {
      setCurrentStep(2); // Skip back over organization
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    triggerImpact('medium');

    try {
      const gameTypeMap: { [key: string]: string } = {
        strokePlay: 'stroke_play',
        matchPlay: 'match_play',
        stableford: 'stableford',
        skins: 'skins',
        nassau: 'nassau',
        scramble: 'scramble',
        bestBall: 'best_ball',
        alternateShot: 'alternate_shot',
        fourball: 'fourball',
        chapman: 'chapman',
      };

      const tournamentPayload = {
        name: tournamentData.basicInfo.name,
        game_type: gameTypeMap[tournamentData.gameType.type] || 'stroke_play',
        course_name: tournamentData.course.name || 'TBD',
        course_rating: tournamentData.course.rating,
        course_slope: tournamentData.course.slope,
        start_date: new Date().toISOString(),
        max_players: tournamentData.basicInfo.maxPlayers,
        status: 'draft',
      };

      await createTournament(tournamentPayload);
      
      triggerNotification('success');
      toast({
        title: 'Tournament Created! 🎉',
        description: `${tournamentData.basicInfo.name} is ready to go`,
      });

      onClose();
      setCurrentStep(0);
    } catch (error) {
      triggerNotification('error');
      toast({
        title: 'Error',
        description: 'Failed to create tournament. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <MobileQuickSetupStep data={tournamentData} onDataChange={handleDataChange} />;
      case 1:
        return <MobileCourseGameStep data={tournamentData} onDataChange={handleDataChange} />;
      case 2:
        return <MobileAdminBettingStep data={tournamentData} onDataChange={handleDataChange} />;
      case 3:
        return <MobileOrganizationStep data={tournamentData} onDataChange={handleDataChange} />;
      case 4:
        return <MobileGoLiveStep data={tournamentData} onCreate={handleCreate} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  const getCurrentStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Quick Setup';
      case 1:
        return 'Course & Game';
      case 2:
        return 'Betting Controls';
      case 3:
        return 'Organize Teams';
      case 4:
        return 'Review & Go Live';
      default:
        return 'Setup Tournament';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return tournamentData.basicInfo.name.trim() && tournamentData.players.length > 0;
      case 1:
        return tournamentData.course.name.trim() && tournamentData.gameType.type;
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-screen flex flex-col pb-safe !z-[60] pt-16">
        <DrawerHeader className="flex-shrink-0 border-b bg-background">
          <div className="flex items-center justify-between">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <DrawerTitle className="flex-1 text-center">
              {getCurrentStepTitle()}
            </DrawerTitle>
            <div className="w-16" />
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {renderStep()}
        </div>

        {currentStep < 4 && (
          <div className="flex-shrink-0 p-4 border-t bg-background">
            <Button
              onClick={handleNext}
              className="w-full h-12 text-base font-semibold"
              size="lg"
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default MobileTournamentSheet;
