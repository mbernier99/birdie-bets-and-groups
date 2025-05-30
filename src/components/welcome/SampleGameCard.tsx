
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SampleGameCardProps {
  title: string;
  description: string;
  gameType: string;
  players: string;
  prize: string;
  icon: LucideIcon;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const SampleGameCard: React.FC<SampleGameCardProps> = ({
  title,
  description,
  gameType,
  players,
  prize,
  icon: Icon,
  difficulty
}) => {
  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-yellow-100 text-yellow-800',
    Advanced: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border border-emerald-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-emerald-50 rounded">
            <div className="font-semibold text-emerald-700">{gameType}</div>
            <div className="text-emerald-600">Format</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-700">{players}</div>
            <div className="text-blue-600">Players</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="font-semibold text-yellow-700">{prize}</div>
            <div className="text-yellow-600">Stakes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SampleGameCard;
