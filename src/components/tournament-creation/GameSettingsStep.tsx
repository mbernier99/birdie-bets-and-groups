import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';
import { Badge } from '@/components/ui/badge';
import EnhancedCourseSearch from '../golf/EnhancedCourseSearch';

interface GameSettingsStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const GameSettingsStep: React.FC<GameSettingsStepProps> = ({ data, onDataChange }) => {
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const isTeamGame = data.gameType.format === 'team';

  const teamSizes = [2, 3, 4, 5];
  const scoresCountedOptions = [1, 2, 3, 4, 5];

  const handleCourseSelect = (course: any) => {
    onDataChange('course', {
      ...data.course,
      name: course.name,
      rating: course.rating,
      slope: course.slope,
    });
    setShowCourseSearch(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Game type badge */}
        <div>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {isTeamGame ? 'Teams' : 'Individual'} • {data.gameType.type?.replace(/([A-Z])/g, ' $1').trim() || 'Select Game'}
          </Badge>
        </div>

        {/* Course selection */}
        <div className="space-y-3">
          <button
            onClick={() => setShowCourseSearch(true)}
            className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg">
                  {data.course.name || 'Select Course'}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Team-specific settings */}
        {isTeamGame && (
          <>
            <div className="space-y-3">
              <Label>Team Size</Label>
              <div className="flex gap-2">
                {teamSizes.map((size) => (
                  <Button
                    key={size}
                    variant={data.gameType.rules?.teamSize === size ? 'default' : 'outline'}
                    onClick={() => onDataChange('gameType', {
                      ...data.gameType,
                      rules: { ...data.gameType.rules, teamSize: size }
                    })}
                    className="flex-1 h-14 text-lg"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Scores Counted per Hole (Combined)</Label>
              <div className="flex gap-2">
                {scoresCountedOptions.slice(0, data.gameType.rules?.teamSize || 2).map((count) => (
                  <Button
                    key={count}
                    variant={data.gameType.rules?.scoresCounted === count ? 'default' : 'outline'}
                    onClick={() => onDataChange('gameType', {
                      ...data.gameType,
                      rules: { ...data.gameType.rules, scoresCounted: count }
                    })}
                    className="flex-1 h-14 text-lg"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tee selections */}
        <div className="space-y-3">
          <Label>Default Men's Tee</Label>
          <button className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{data.course.teeBox || 'Select Tee'}</div>
                {data.course.rating && (
                  <div className="text-sm text-muted-foreground">
                    {data.course.rating} / {data.course.slope}
                  </div>
                )}
              </div>
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>
        </div>

        <div className="space-y-3">
          <Label>Default Women's Tee</Label>
          <button className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{data.course.teeBox || 'Select Tee'}</div>
                {data.course.rating && (
                  <div className="text-sm text-muted-foreground">
                    {data.course.rating} / {data.course.slope}
                  </div>
                )}
              </div>
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>
        </div>
      </div>

      {showCourseSearch && (
        <Dialog open={showCourseSearch} onOpenChange={setShowCourseSearch}>
          <DialogContent className="max-w-3xl h-[80vh]">
            <EnhancedCourseSearch />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GameSettingsStep;
