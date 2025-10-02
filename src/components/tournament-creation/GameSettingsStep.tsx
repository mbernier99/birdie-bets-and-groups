import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
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
    // Load course with all available tees
    const availableTees = course.course_tees || [];
    
    onDataChange('course', {
      ...data.course,
      id: course.id,
      name: course.name,
      location: course.location,
      holes: course.holes,
      par: course.par,
      availableTees: availableTees,
      rating: course.rating || availableTees[0]?.rating,
      slope: course.slope || availableTees[0]?.slope,
    });
    setShowCourseSearch(false);
  };

  const handleTeeSelect = (teeType: 'men' | 'women', teeData: any) => {
    onDataChange('course', {
      ...data.course,
      [teeType === 'men' ? 'mensTee' : 'womensTee']: teeData.tee_name,
      [teeType === 'men' ? 'mensRating' : 'womensRating']: teeData.rating,
      [teeType === 'men' ? 'mensSlope' : 'womensSlope']: teeData.slope,
    });
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

        {/* Tee selections - only show if course is selected */}
        {data.course.name && data.course.availableTees && data.course.availableTees.length > 0 && (
          <>
            <div className="space-y-3">
              <Label>Default Men's Tee</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{data.course.mensTee || 'Select Tee'}</div>
                        {data.course.mensRating && (
                          <div className="text-sm text-muted-foreground">
                            Rating: {data.course.mensRating} / Slope: {data.course.mensSlope}
                          </div>
                        )}
                      </div>
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Select Men's Tee</h3>
                    {data.course.availableTees.map((tee: any) => (
                      <div
                        key={tee.id}
                        className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => {
                          handleTeeSelect('men', tee);
                        }}
                      >
                        <div className="font-semibold">{tee.tee_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Rating: {tee.rating} • Slope: {tee.slope} • {tee.total_yardage} yards
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              <Label>Default Women's Tee</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{data.course.womensTee || 'Select Tee'}</div>
                        {data.course.womensRating && (
                          <div className="text-sm text-muted-foreground">
                            Rating: {data.course.womensRating} / Slope: {data.course.womensSlope}
                          </div>
                        )}
                      </div>
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Select Women's Tee</h3>
                    {data.course.availableTees.map((tee: any) => (
                      <div
                        key={tee.id}
                        className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => {
                          handleTeeSelect('women', tee);
                        }}
                      >
                        <div className="font-semibold">{tee.tee_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Rating: {tee.rating} • Slope: {tee.slope} • {tee.total_yardage} yards
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </div>

      {showCourseSearch && (
        <Dialog open={showCourseSearch} onOpenChange={setShowCourseSearch}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
            <EnhancedCourseSearch onCourseImported={handleCourseSelect} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GameSettingsStep;
