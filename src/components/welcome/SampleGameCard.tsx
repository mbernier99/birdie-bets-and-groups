
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
    <Card className="hover:shadow-lg transition-shadow duration-300 border-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg text-emerald-900">{title}</CardTitle>
          </div>
          <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-emerald-700 text-sm mb-4">{description}</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-emerald-200 rounded-xl">
            <div className="font-semibold text-emerald-800">{gameType}</div>
            <div className="text-emerald-700">Format</div>
          </div>
          <div className="text-center p-2 bg-emerald-200 rounded-xl">
            <div className="font-semibold text-emerald-800">{players}</div>
            <div className="text-emerald-700">Players</div>
          </div>
          <div className="text-center p-2 bg-emerald-200 rounded-xl">
            <div className="font-semibold text-emerald-800">{prize}</div>
            <div className="text-emerald-700">Stakes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SampleGameCard;
