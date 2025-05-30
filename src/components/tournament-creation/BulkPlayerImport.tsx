
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface BulkPlayerImportProps {
  onAddPlayers: (players: Player[]) => void;
}

export const BulkPlayerImport: React.FC<BulkPlayerImportProps> = ({ onAddPlayers }) => {
  const [bulkEmails, setBulkEmails] = useState('');

  const processBulkEmails = () => {
    const emails = bulkEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    const newPlayers = emails.map(email => ({
      id: Date.now().toString() + Math.random(),
      name: email.split('@')[0],
      email: email,
      handicapIndex: 18,
      status: 'invited' as const
    }));

    onAddPlayers(newPlayers);
    setBulkEmails('');
  };

  return (
    <div className="space-y-2">
      <Label>Bulk Add Players (one email per line or comma-separated)</Label>
      <textarea
        className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-20"
        placeholder="player1@email.com, player2@email.com
player3@email.com"
        value={bulkEmails}
        onChange={(e) => setBulkEmails(e.target.value)}
      />
      <Button 
        onClick={processBulkEmails}
        variant="outline"
        disabled={!bulkEmails.trim()}
      >
        Import Players
      </Button>
    </div>
  );
};
