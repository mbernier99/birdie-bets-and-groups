import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Plus, Trophy } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';
import EnhancedCourseSearch from '../golf/EnhancedCourseSearch';
import GameFormatCard from './GameFormatCard';
import SideGameChip from './SideGameChip';
import GameConfigDrawer from './GameConfigDrawer';
import RulesModal from './RulesModal';
import { traditionalFormats, sideGames, gameRules, gameConfigFields } from './gameFormats';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface GameSettingsStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const GameSettingsStep: React.FC<GameSettingsStepProps> = ({ data, onDataChange }) => {
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const [showMensTeeDialog, setShowMensTeeDialog] = useState(false);
  const [showWomensTeeDialog, setShowWomensTeeDialog] = useState(false);
  const [sideGamesExpanded, setSideGamesExpanded] = useState(false);
  const [configDrawer, setConfigDrawer] = useState<{ isOpen: boolean; gameId: string; gameName: string } | null>(null);
  const [rulesModal, setRulesModal] = useState<{ isOpen: boolean; gameId: string; gameName: string } | null>(null);

  // Initialize gameConfig if not exists
  const gameConfig = data.gameType.rules?.gameConfig || {
    primaryFormat: null,
    sideGames: [],
  };

  const updateGameConfig = (updates: any) => {
    onDataChange('gameType', {
      ...data.gameType,
      type: updates.primaryFormat || gameConfig.primaryFormat || '',
      rules: {
        ...data.gameType.rules,
        gameConfig: { ...gameConfig, ...updates },
      },
    });
  };

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
    
    if (teeType === 'men') {
      setShowMensTeeDialog(false);
    } else {
      setShowWomensTeeDialog(false);
    }
  };

  const handleFormatSelect = (formatId: string) => {
    const format = traditionalFormats.find(f => f.id === formatId);
    if (!format) return;

    updateGameConfig({ primaryFormat: formatId });

    // Open config drawer if format has configuration
    if (gameConfigFields[formatId]) {
      setConfigDrawer({ isOpen: true, gameId: formatId, gameName: format.name });
    }
  };

  const handleSideGameToggle = (gameId: string) => {
    const isActive = gameConfig.sideGames?.some((sg: any) => sg.id === gameId);
    const game = sideGames.find(g => g.id === gameId);
    
    if (isActive) {
      // Remove side game
      updateGameConfig({
        sideGames: gameConfig.sideGames.filter((sg: any) => sg.id !== gameId),
      });
    } else {
      // Add side game with default config
      const defaultConfig = gameConfigFields[gameId]?.reduce((acc, field) => {
        acc[field.key] = field.defaultValue;
        return acc;
      }, {} as any) || {};

      updateGameConfig({
        sideGames: [...(gameConfig.sideGames || []), { id: gameId, name: game?.name, config: defaultConfig }],
      });

      // Open config drawer
      if (gameConfigFields[gameId] && game) {
        setConfigDrawer({ isOpen: true, gameId, gameName: game.name });
      }
    }
  };

  const handleConfigSave = (gameId: string, config: any) => {
    if (gameId === gameConfig.primaryFormat) {
      // Update primary format config
      updateGameConfig({
        primaryFormatConfig: config,
      });
    } else {
      // Update side game config
      const updatedSideGames = gameConfig.sideGames?.map((sg: any) =>
        sg.id === gameId ? { ...sg, config } : sg
      );
      updateGameConfig({ sideGames: updatedSideGames });
    }
  };

  const handleShowRules = (formatId: string) => {
    const format = traditionalFormats.find(f => f.id === formatId);
    if (format && gameRules[formatId]) {
      setRulesModal({ isOpen: true, gameId: formatId, gameName: format.name });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Traditional Formats - Horizontal Scroll */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold px-6">Traditional Formats</Label>
          <div className="relative">
            <div 
              className="flex gap-4 overflow-x-auto pb-4 px-6 snap-x snap-mandatory scrollbar-hide touch-pan-x"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {traditionalFormats.map((format) => (
                <GameFormatCard
                  key={format.id}
                  format={format}
                  isSelected={gameConfig.primaryFormat === format.id}
                  onSelect={() => handleFormatSelect(format.id)}
                  onShowRules={format.hasRules ? () => handleShowRules(format.id) : undefined}
                />
              ))}
            </div>
          </div>
          {gameConfig.primaryFormat && (
            <p className="text-sm text-muted-foreground px-6">
              {traditionalFormats.find(f => f.id === gameConfig.primaryFormat)?.description}
            </p>
          )}
        </div>

        {/* + Add Side Game */}
        <div className="space-y-3 px-6">
          <Collapsible open={sideGamesExpanded} onOpenChange={setSideGamesExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2 h-12 text-base">
                <Plus className="h-5 w-5" />
                Add Side Game
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-2">
              {sideGames.map((game) => {
                const isActive = gameConfig.sideGames?.some((sg: any) => sg.id === game.id);
                return (
                  <Button
                    key={game.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start h-12 text-base"
                    onClick={() => handleSideGameToggle(game.id)}
                  >
                    {isActive ? '✓ ' : ''}
                    {game.name}
                  </Button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Active Side Games Chips */}
          {gameConfig.sideGames && gameConfig.sideGames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {gameConfig.sideGames.map((sg: any) => (
                <SideGameChip
                  key={sg.id}
                  name={sg.name}
                  onRemove={() => handleSideGameToggle(sg.id)}
                  onClick={() => {
                    if (gameConfigFields[sg.id]) {
                      setConfigDrawer({ isOpen: true, gameId: sg.id, gameName: sg.name });
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Course selection */}
        <div className="space-y-3 px-6">
          <Label className="text-base">Course</Label>
          <button
            onClick={() => setShowCourseSearch(true)}
            className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left active:scale-98"
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">
                  {data.course.name || 'Select Course'}
                </div>
                {data.course.location && (
                  <div className="text-sm text-muted-foreground mt-1">{data.course.location}</div>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Date */}
        <div className="space-y-2 px-6">
          <Label className="text-base">Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="pl-10 h-14 text-base"
            />
          </div>
        </div>

        {/* Tee selections - only show if course is selected */}
        {data.course.name && data.course.availableTees && data.course.availableTees.length > 0 && (
          <>
            <div className="space-y-3 px-6">
              <Label className="text-base">Default Men's Tee</Label>
              <Dialog open={showMensTeeDialog} onOpenChange={setShowMensTeeDialog}>
                <DialogTrigger asChild>
                  <button className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left active:scale-98">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base">{data.course.mensTee || 'Select Tee'}</div>
                        {data.course.mensRating && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Rating: {data.course.mensRating} / Slope: {data.course.mensSlope}
                          </div>
                        )}
                      </div>
                      <Trophy className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
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

            <div className="space-y-3 px-6">
              <Label className="text-base">Default Women's Tee</Label>
              <Dialog open={showWomensTeeDialog} onOpenChange={setShowWomensTeeDialog}>
                <DialogTrigger asChild>
                  <button className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left active:scale-98">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base">{data.course.womensTee || 'Select Tee'}</div>
                        {data.course.womensRating && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Rating: {data.course.womensRating} / Slope: {data.course.womensSlope}
                          </div>
                        )}
                      </div>
                      <Trophy className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
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

      {/* Game Config Drawer */}
      {configDrawer && (
        <GameConfigDrawer
          isOpen={configDrawer.isOpen}
          onClose={() => setConfigDrawer(null)}
          gameName={configDrawer.gameName}
          config={
            configDrawer.gameId === gameConfig.primaryFormat
              ? gameConfig.primaryFormatConfig || {}
              : gameConfig.sideGames?.find((sg: any) => sg.id === configDrawer.gameId)?.config || {}
          }
          onSave={(config) => handleConfigSave(configDrawer.gameId, config)}
          fields={gameConfigFields[configDrawer.gameId] || []}
        />
      )}

      {/* Rules Modal */}
      {rulesModal && (
        <RulesModal
          isOpen={rulesModal.isOpen}
          onClose={() => setRulesModal(null)}
          gameName={rulesModal.gameName}
          rules={gameRules[rulesModal.gameId] || []}
        />
      )}
    </div>
  );
};

export default GameSettingsStep;
