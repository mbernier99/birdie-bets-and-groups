
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { playerSchema, validateAndSanitizeForm } from '@/utils/validators';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ onAddPlayer }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerHandicap, setNewPlayerHandicap] = useState('');
  const { toast } = useToast();

  const addPlayer = () => {
    if (!newPlayerName || !newPlayerEmail || !newPlayerHandicap) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const formData = {
      name: newPlayerName,
      email: newPlayerEmail,
      handicapIndex: newPlayerHandicap,
    };

    // Validate each field separately since playerSchema expects different types
    const playerValidation = playerSchema.safeParse({
      name: formData.name,
      email: formData.email,
      handicapIndex: parseFloat(formData.handicapIndex),
    });

    if (!playerValidation.success) {
      const errorMessage = playerValidation.error.issues.map(issue => issue.message).join(', ');
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: playerValidation.data.name,
      email: playerValidation.data.email,
      handicapIndex: playerValidation.data.handicapIndex,
      status: 'invited' as const
    };

    onAddPlayer(newPlayer);
    setNewPlayerName('');
    setNewPlayerEmail('');
    setNewPlayerHandicap('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Input
        placeholder="Player name"
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
      />
      <Input
        placeholder="Email address"
        value={newPlayerEmail}
        onChange={(e) => setNewPlayerEmail(e.target.value)}
      />
      <Input
        placeholder="Handicap index"
        type="number"
        step="0.1"
        value={newPlayerHandicap}
        onChange={(e) => setNewPlayerHandicap(e.target.value)}
      />
      <Button onClick={addPlayer} className="bg-emerald-600 hover:bg-emerald-700">
        Add Player
      </Button>
    </div>
  );
};
