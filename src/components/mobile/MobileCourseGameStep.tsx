import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Edit, DollarSign, Trophy, Zap } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';
import EnhancedCourseSearch from '../golf/EnhancedCourseSearch';
import { useToast } from '@/hooks/use-toast';

interface MobileCourseGameStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const MobileCourseGameStep: React.FC<MobileCourseGameStepProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const [courseTab, setCourseTab] = useState<'search' | 'manual'>('search');

  const handleCourseChange = (field: string, value: any) => {
    onDataChange('course', { ...data.course, [field]: value });
  };

  const handleGameTypeChange = (field: string, value: any) => {
    onDataChange('gameType', { ...data.gameType, [field]: value });
    
    // Auto-update wagering based on game type
    if (field === 'type') {
      updateWageringForGameType(value);
    }
  };

  const handleWageringChange = (field: string, value: any) => {
    onDataChange('wagering', { ...data.wagering, [field]: value });
  };

  const handleRuleChange = (rule: string, value: any) => {
    onDataChange('gameType', {
      ...data.gameType,
      rules: { ...data.gameType.rules, [rule]: value }
    });
  };

  const updateWageringForGameType = (gameType: string) => {
    const wageringDefaults: Record<string, any> = {
      'nassau': { 
        entryFee: 10,
        payoutStructure: 'nassau-split',
        nassauBets: { front9: 5, back9: 5, overall: 5 }
      },
      'skins': { 
        entryFee: 20,
        payoutStructure: 'skins-carryover',
        skinValue: 5
      },
      'match-play': { 
        entryFee: 25,
        payoutStructure: 'winner-takes-all'
      },
      'stroke-play': { 
        entryFee: 20,
        payoutStructure: 'top-3'
      },
    };

    const defaults = wageringDefaults[gameType] || { entryFee: 0, payoutStructure: 'winner-takes-all' };
    onDataChange('wagering', { ...data.wagering, ...defaults });
  };

  const handleCourseImport = (importedCourse: any) => {
    const holes = importedCourse.holes?.map((hole: any, index: number) => ({
      number: index + 1,
      par: hole.par || 4,
      yardage: hole.yardage || 350,
      handicapIndex: hole.handicap || index + 1
    })) || Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      yardage: 350,
      handicapIndex: i + 1
    }));

    onDataChange('course', {
      name: importedCourse.name,
      teeBox: 'white',
      rating: importedCourse.rating || 72.0,
      slope: importedCourse.slope || 113,
      holes: holes
    });

    toast({
      title: "Course Imported",
      description: `${importedCourse.name} loaded successfully`,
    });

    setCourseTab('manual');
  };

  const gameTypes = [
    { id: 'stroke-play', name: 'Stroke Play', description: 'Lowest total score wins', betting: 'Entry fee + prize pool' },
    { id: 'match-play', name: 'Match Play', description: 'Head-to-head holes won', betting: 'Winner takes all' },
    { id: 'nassau', name: 'Nassau', description: 'Front 9, Back 9, Overall', betting: 'Three separate bets' },
    { id: 'skins', name: 'Skins', description: 'Lowest score wins the hole', betting: 'Per-skin value with carryover' },
    { id: 'stableford', name: 'Stableford', description: 'Points-based scoring', betting: 'Entry fee + prize pool' },
  ];

  const renderGameTypeWagering = () => {
    const gameType = data.gameType.type;

    switch (gameType) {
      case 'nassau':
        return (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Nassau Betting Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Front 9</Label>
                  <Input
                    type="number"
                    value={data.gameType.rules?.nassauBets?.front9 || 5}
                    onChange={(e) => handleRuleChange('nassauBets', {
                      ...data.gameType.rules?.nassauBets,
                      front9: parseFloat(e.target.value)
                    })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Back 9</Label>
                  <Input
                    type="number"
                    value={data.gameType.rules?.nassauBets?.back9 || 5}
                    onChange={(e) => handleRuleChange('nassauBets', {
                      ...data.gameType.rules?.nassauBets,
                      back9: parseFloat(e.target.value)
                    })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Overall</Label>
                  <Input
                    type="number"
                    value={data.gameType.rules?.nassauBets?.overall || 5}
                    onChange={(e) => handleRuleChange('nassauBets', {
                      ...data.gameType.rules?.nassauBets,
                      overall: parseFloat(e.target.value)
                    })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Total per player: ${((data.gameType.rules?.nassauBets?.front9 || 5) + 
                  (data.gameType.rules?.nassauBets?.back9 || 5) + 
                  (data.gameType.rules?.nassauBets?.overall || 5))}
              </div>
            </CardContent>
          </Card>
        );

      case 'skins':
        return (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Skins Game Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Value Per Skin</Label>
                <Input
                  type="number"
                  value={data.wagering.skinValue || 5}
                  onChange={(e) => handleWageringChange('skinValue', parseFloat(e.target.value))}
                  className="h-8"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Carryover enabled</span>
                <span className="font-medium">18 holes × ${data.wagering.skinValue || 5} = ${(data.wagering.skinValue || 5) * 18}</span>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Prize Pool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Entry Fee</Label>
                  <Input
                    type="number"
                    value={data.wagering.entryFee === 0 ? '' : data.wagering.entryFee}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        handleWageringChange('entryFee', value);
                      }
                    }}
                    className="h-8"
                  />
                </div>
              <div>
                <Label className="text-xs">Payout Structure</Label>
                <Select 
                  value={data.wagering.payoutStructure} 
                  onValueChange={(v) => handleWageringChange('payoutStructure', v)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="winner-takes-all">Winner Takes All</SelectItem>
                    <SelectItem value="top-3">Top 3 Split</SelectItem>
                    <SelectItem value="50-30-20">50/30/20 Split</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Total prize pool: ${data.wagering.entryFee * data.players.length}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const isComplete = data.course.name.trim() && data.gameType.type;

  return (
    <div className="space-y-4">
      {/* Course Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={courseTab} onValueChange={(v) => setCourseTab(v as 'search' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="search" className="text-xs">
                <Search className="h-3 w-3 mr-1" />
                Search
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs">
                <Edit className="h-3 w-3 mr-1" />
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-3 mt-3">
              <EnhancedCourseSearch onCourseImported={handleCourseImport} />
            </TabsContent>

            <TabsContent value="manual" className="space-y-3 mt-3">
              <div>
                <Label className="text-xs">Course Name</Label>
                <Input
                  value={data.course.name}
                  onChange={(e) => handleCourseChange('name', e.target.value)}
                  placeholder="Pebble Beach Golf Links"
                  className="h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Tee Box</Label>
                  <Select value={data.course.teeBox} onValueChange={(v) => handleCourseChange('teeBox', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Rating / Slope</Label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      step="0.1"
                      value={data.course.rating}
                      onChange={(e) => handleCourseChange('rating', parseFloat(e.target.value))}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      value={data.course.slope}
                      onChange={(e) => handleCourseChange('slope', parseInt(e.target.value))}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {data.course.name && (
            <div className="mt-3 p-2 bg-primary/5 rounded text-xs text-muted-foreground">
              ✓ {data.course.name} - {data.course.teeBox} tees
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Type Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Game Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={data.gameType.type} onValueChange={(v) => handleGameTypeChange('type', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select game format" />
            </SelectTrigger>
            <SelectContent>
              {gameTypes.map(gt => (
                <SelectItem key={gt.id} value={gt.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{gt.name}</span>
                    <span className="text-xs text-muted-foreground">{gt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {data.gameType.type && (
            <div className="p-2 bg-muted/50 rounded text-xs">
              {gameTypes.find(gt => gt.id === data.gameType.type)?.betting}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game-Specific Wagering */}
      {data.gameType.type && renderGameTypeWagering()}

      {/* Completion Status */}
      {!isComplete && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
          Please select a course and game format to continue
        </div>
      )}
    </div>
  );
};

export default MobileCourseGameStep;
