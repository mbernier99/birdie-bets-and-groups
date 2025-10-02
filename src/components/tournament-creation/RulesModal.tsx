import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
  rules: string[];
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, gameName, rules }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{gameName} Rules</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {rules.map((rule, index) => (
            <p key={index} className="text-sm leading-relaxed">
              {rule}
            </p>
          ))}
        </div>

        <Button onClick={onClose} className="w-full">
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RulesModal;
