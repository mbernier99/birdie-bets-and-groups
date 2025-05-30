
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TournamentData } from '../CreateTournamentModal';

interface CourseSetupStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const CourseSetupStep: React.FC<CourseSetupStepProps> = ({ data, onDataChange }) => {
  const [viewMode, setViewMode] = useState<'summary' | 'holes'>('summary');

  const handleCourseChange = (field: string, value: any) => {
    onDataChange('course', {
      ...data.course,
      [field]: value
    });
  };

  const handleHoleChange = (holeIndex: number, field: string, value: any) => {
    const updatedHoles = [...data.course.holes];
    updatedHoles[holeIndex] = {
      ...updatedHoles[holeIndex],
      [field]: field === 'par' || field === 'yardage' || field === 'handicapIndex' ? parseInt(value) : value
    };
    handleCourseChange('holes', updatedHoles);
  };

  const fillStandardPars = () => {
    const standardPars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4];
    const updatedHoles = data.course.holes.map((hole, index) => ({
      ...hole,
      par: standardPars[index]
    }));
    handleCourseChange('holes', updatedHoles);
  };

  const totalPar = data.course.holes.reduce((sum, hole) => sum + hole.par, 0);
  const totalYardage = data.course.holes.reduce((sum, hole) => sum + hole.yardage, 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Course Setup</h3>
      
      {/* Course Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="course-name">Course Name</Label>
          <Input
            id="course-name"
            value={data.course.name}
            onChange={(e) => handleCourseChange('name', e.target.value)}
            placeholder="Pine Valley Golf Club"
          />
        </div>

        <div className="space-y-2">
          <Label>Tee Box</Label>
          <Select value={data.course.teeBox} onValueChange={(value) => handleCourseChange('teeBox', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="black">Black Tees (Championship)</SelectItem>
              <SelectItem value="blue">Blue Tees (Men's)</SelectItem>
              <SelectItem value="white">White Tees (Regular)</SelectItem>
              <SelectItem value="red">Red Tees (Forward)</SelectItem>
              <SelectItem value="gold">Gold Tees (Senior)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-rating">Course Rating</Label>
          <Input
            id="course-rating"
            type="number"
            step="0.1"
            value={data.course.rating}
            onChange={(e) => handleCourseChange('rating', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-slope">Slope Rating</Label>
          <Input
            id="course-slope"
            type="number"
            value={data.course.slope}
            onChange={(e) => handleCourseChange('slope', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Course Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-600">{totalPar}</div>
            <div className="text-sm text-gray-600">Total Par</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{totalYardage.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Yardage</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{data.course.rating}</div>
            <div className="text-sm text-gray-600">Course Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{data.course.slope}</div>
            <div className="text-sm text-gray-600">Slope Rating</div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={fillStandardPars} variant="outline">
            Fill Standard Pars
          </Button>
        </div>
      </div>

      {/* Optional Hole Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Hole Details (Optional)</h4>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'summary' ? 'default' : 'outline'}
              onClick={() => setViewMode('summary')}
              size="sm"
            >
              Hide Details
            </Button>
            <Button
              variant={viewMode === 'holes' ? 'default' : 'outline'}
              onClick={() => setViewMode('holes')}
              size="sm"
            >
              Edit Holes
            </Button>
          </div>
        </div>

        {viewMode === 'holes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 pb-2 border-b">
              <div>Hole</div>
              <div>Par</div>
              <div>Yardage</div>
              <div>HCP Index</div>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {data.course.holes.map((hole, index) => (
                <div key={hole.number} className="grid grid-cols-4 gap-2 items-center">
                  <div className="font-medium">{hole.number}</div>
                  <Input
                    type="number"
                    min="3"
                    max="6"
                    value={hole.par}
                    onChange={(e) => handleHoleChange(index, 'par', e.target.value)}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    min="100"
                    max="800"
                    value={hole.yardage}
                    onChange={(e) => handleHoleChange(index, 'yardage', e.target.value)}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="18"
                    value={hole.handicapIndex}
                    onChange={(e) => handleHoleChange(index, 'handicapIndex', e.target.value)}
                    className="h-8"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSetupStep;
