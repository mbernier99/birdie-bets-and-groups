import React from 'react';
import { User, Users, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TournamentData } from '../CreateTournamentModal';

interface FormatSelectionStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const FormatSelectionStep: React.FC<FormatSelectionStepProps> = ({ data, onDataChange }) => {
  const handleFormatSelect = (format: 'individual' | 'team') => {
    onDataChange('gameType', {
      ...data.gameType,
      format: format,
      type: '' // Reset game type when format changes
    });
  };

  const selectedFormat = data.gameType.format;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Select Format</h3>
        <p className="text-muted-foreground">Choose how you want to compete</p>
      </div>

      <div className="space-y-4">
        {/* Individual Formats */}
        <Card
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            selectedFormat === 'individual'
              ? 'border-2 border-primary bg-primary/5'
              : 'border-2 border-border hover:border-primary/50'
          }`}
          onClick={() => handleFormatSelect('individual')}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              selectedFormat === 'individual' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary/10 text-primary'
            }`}>
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground mb-1">Individual Formats</h4>
              <p className="text-sm text-muted-foreground">
                You vs. the field, Stroke Play or Stableford
              </p>
            </div>
            <ChevronRight className={`h-5 w-5 ${
              selectedFormat === 'individual' ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>
        </Card>

        {/* Team Formats */}
        <Card
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            selectedFormat === 'team'
              ? 'border-2 border-primary bg-primary/5'
              : 'border-2 border-border hover:border-primary/50'
          }`}
          onClick={() => handleFormatSelect('team')}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              selectedFormat === 'team' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary/10 text-primary'
            }`}>
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground mb-1">Team Formats</h4>
              <p className="text-sm text-muted-foreground">
                Team up to play games like Best Ball, Scramble, Chapman or Alternate Shot
              </p>
            </div>
            <ChevronRight className={`h-5 w-5 ${
              selectedFormat === 'team' ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>
        </Card>
      </div>

      {/* Info Box */}
      {selectedFormat && (
        <Card className="p-4 bg-accent/50 border-accent">
          <div className="flex gap-3">
            <div className="p-2 bg-primary/10 rounded-full h-fit">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-1">Did you know?</h5>
              <p className="text-sm text-muted-foreground">
                {selectedFormat === 'individual' 
                  ? 'Individual formats support optional Match Play or Nassau side games, plus Skins pots.'
                  : 'All team game types support optional individual or team Match Play or Nassau side games, plus Skins pots.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className={`p-4 rounded-lg border ${
        selectedFormat 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <h4 className={`font-medium mb-2 ${
          selectedFormat ? 'text-emerald-900' : 'text-yellow-900'
        }`}>
          {selectedFormat ? 'Format Selected!' : 'Select a Format'}
        </h4>
        <p className={`text-sm ${
          selectedFormat ? 'text-emerald-700' : 'text-yellow-700'
        }`}>
          {selectedFormat 
            ? 'Great! Next, you\'ll choose the specific game type.'
            : 'Please select a format to continue.'
          }
        </p>
      </div>
    </div>
  );
};

export default FormatSelectionStep;
