
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Hole {
  number: number;
  par: number;
  yardage: number;
  handicapIndex: number;
}

interface ScorecardEntryProps {
  holes: Hole[];
  onHoleChange: (holeIndex: number, field: string, value: any) => void;
}

const ScorecardEntry: React.FC<ScorecardEntryProps> = ({
  holes,
  onHoleChange
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'scorecard'>('summary');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Enter Scorecard (Optional)</h4>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'summary' ? 'default' : 'outline'}
            onClick={() => setViewMode('summary')}
            size="sm"
          >
            Hide Scorecard
          </Button>
          <Button
            variant={viewMode === 'scorecard' ? 'default' : 'outline'}
            onClick={() => setViewMode('scorecard')}
            size="sm"
          >
            Enter Scorecard
          </Button>
        </div>
      </div>

      {viewMode === 'scorecard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 pb-2 border-b">
            <div>Hole</div>
            <div>Par</div>
            <div>Yardage</div>
            <div>HCP Index</div>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {holes.map((hole, index) => (
              <div key={hole.number} className="grid grid-cols-4 gap-2 items-center">
                <div className="font-medium">{hole.number}</div>
                <Input
                  type="number"
                  min="3"
                  max="6"
                  value={hole.par}
                  onChange={(e) => onHoleChange(index, 'par', e.target.value)}
                  className="h-8"
                />
                <Input
                  type="number"
                  min="100"
                  max="800"
                  value={hole.yardage}
                  onChange={(e) => onHoleChange(index, 'yardage', e.target.value)}
                  className="h-8"
                />
                <Input
                  type="number"
                  min="1"
                  max="18"
                  value={hole.handicapIndex}
                  onChange={(e) => onHoleChange(index, 'handicapIndex', e.target.value)}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScorecardEntry;
