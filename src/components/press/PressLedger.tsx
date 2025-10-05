
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Press } from '../../types/press';

interface PressLedgerProps {
  presses: Press[];
  currentUserId: string;
  players: Array<{ id: string; name: string }>;
}

const PressLedger: React.FC<PressLedgerProps> = ({
  presses,
  currentUserId,
  players
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending' | 'pushed'>('all');

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown';
  };

  const filteredPresses = presses.filter(press => {
    if (filter === 'all') return true;
    if (filter === 'active') return press.status === 'accepted' || press.status === 'active';
    if (filter === 'completed') return press.status === 'completed';
    if (filter === 'pending') return press.status === 'pending';
    if (filter === 'pushed') return press.status === 'pushed';
    return true;
  });

  const userPresses = filteredPresses.filter(press => 
    press.initiatorId === currentUserId || press.targetId === currentUserId
  );

  const getStatusColor = (status: Press['status']) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'pushed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateWinnings = () => {
    const completed = userPresses.filter(p => p.status === 'completed');
    const won = completed.filter(p => p.winner === currentUserId);
    const lost = completed.filter(p => p.winner && p.winner !== currentUserId);
    
    const totalWon = won.reduce((sum, p) => sum + p.amount, 0);
    const totalLost = lost.reduce((sum, p) => sum + p.amount, 0);
    
    return { totalWon, totalLost, netWinnings: totalWon - totalLost };
  };

  const { totalWon, totalLost, netWinnings } = calculateWinnings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Press Ledger</span>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="pushed">Pushed (Tie)</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">${totalWon}</p>
              <p className="text-xs text-gray-600">Won</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">${totalLost}</p>
              <p className="text-xs text-gray-600">Lost</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${netWinnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(netWinnings)}
              </p>
              <p className="text-xs text-gray-600">Net</p>
            </div>
          </div>

          {/* Press List */}
          <div className="space-y-2">
            {userPresses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No presses to display</p>
            ) : (
              userPresses.map(press => {
                const isInitiator = press.initiatorId === currentUserId;
                const opponent = getPlayerName(isInitiator ? press.targetId : press.initiatorId);
                
                return (
                  <div key={press.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {isInitiator ? 'vs' : 'from'} {opponent}
                        </span>
                        <Badge className={getStatusColor(press.status)}>
                          {press.status}
                        </Badge>
                      </div>
                      <span className="font-bold">${press.amount}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Start: Hole {press.startHole} | {press.gameType.replace('-', ' ')}</p>
                      <p>{press.winCondition}</p>
                      {press.winner && (
                        <p className={press.winner === currentUserId ? 'text-green-600' : 'text-red-600'}>
                          Winner: {press.winner === currentUserId ? 'You' : getPlayerName(press.winner)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PressLedger;
