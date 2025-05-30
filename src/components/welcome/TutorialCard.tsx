
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TutorialCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  onAction: () => void;
  gradient: string;
  iconColor: string;
}

const TutorialCard: React.FC<TutorialCardProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
  gradient,
  iconColor
}) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
      <div className={`h-2 ${gradient}`} />
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
        <Button 
          onClick={onAction}
          className="w-full group-hover:bg-emerald-600 transition-colors"
          variant="outline"
        >
          {actionText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TutorialCard;
