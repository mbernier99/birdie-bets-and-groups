import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BulkPlayerImport } from './BulkPlayerImport';
import { LoadFromRosterTab } from './LoadFromRosterTab';
import {
  Plus, 
  Users, 
  Upload, 
  UserPlus, 
  X, 
  Edit2, 
  Save, 
  Contact,
  Trash2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface PlayerManagementModalProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  maxPlayers: number;
  children: React.ReactNode;
}

interface QuickAddFormProps {
  onAddPlayer: (player: Player) => void;
}

const QuickAddForm: React.FC<QuickAddFormProps> = ({ onAddPlayer }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [handicap, setHandicap] = useState('18');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Player name is required",
        variant: "destructive",
      });
      return;
    }

    const newPlayer: Player = {
      id: `player-${Date.now()}-${Math.random()}`,
      name: name.trim(),
      email: email.trim(),
      handicapIndex: parseFloat(handicap) || 18,
      status: 'invited'
    };

    onAddPlayer(newPlayer);
    setName('');
    setEmail('');
    setHandicap('18');
    
    toast({
      title: "Player Added",
      description: `${newPlayer.name} has been added to the tournament`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Quick Add Player
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-name">Player Name *</Label>
            <Input
              id="quick-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quick-email">Email (for invitation)</Label>
            <Input
              id="quick-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quick-handicap">Handicap Index</Label>
            <Input
              id="quick-handicap"
              type="number"
              step="0.1"
              min="0"
              max="54"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

interface PlayerCardProps {
  player: Player;
  onUpdate: (player: Player) => void;
  onRemove: (playerId: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(player.name);
  const [editEmail, setEditEmail] = useState(player.email);
  const [editHandicap, setEditHandicap] = useState(player.handicapIndex.toString());

  const handleSave = () => {
    const updatedPlayer = {
      ...player,
      name: editName.trim(),
      email: editEmail.trim(),
      handicapIndex: parseFloat(editHandicap) || 18
    };
    onUpdate(updatedPlayer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(player.name);
    setEditEmail(player.email);
    setEditHandicap(player.handicapIndex.toString());
    setIsEditing(false);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Player name"
            />
            <Input
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
              type="email"
            />
            <Input
              value={editHandicap}
              onChange={(e) => setEditHandicap(e.target.value)}
              placeholder="Handicap"
              type="number"
              step="0.1"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{player.name || 'Unnamed Player'}</h4>
                {player.email && (
                  <p className="text-sm text-muted-foreground">{player.email}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Handicap: {player.handicapIndex}
                </p>
              </div>
              <div className="flex gap-1">
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button 
                  onClick={() => onRemove(player.id)} 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Badge variant={player.status === 'accepted' ? 'default' : 'secondary'}>
              {player.status}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PlayerManagementModal: React.FC<PlayerManagementModalProps> = ({ 
  players, 
  onPlayersChange, 
  maxPlayers, 
  children 
}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAddPlayer = (player: Player) => {
    if (players.length >= maxPlayers) {
      toast({
        title: "Player Limit Reached",
        description: `Maximum of ${maxPlayers} players allowed`,
        variant: "destructive",
      });
      return;
    }
    onPlayersChange([...players, player]);
  };

  const handleAddPlayers = (newPlayers: Player[]) => {
    const totalPlayers = players.length + newPlayers.length;
    if (totalPlayers > maxPlayers) {
      toast({
        title: "Player Limit Exceeded",
        description: `Cannot add ${newPlayers.length} players. Maximum is ${maxPlayers} total.`,
        variant: "destructive",
      });
      return;
    }
    onPlayersChange([...players, ...newPlayers]);
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    onPlayersChange(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const handleRemovePlayer = (playerId: string) => {
    onPlayersChange(players.filter(p => p.id !== playerId));
  };

  const handleClearAll = () => {
    onPlayersChange([]);
    toast({
      title: "All Players Removed",
      description: "Player list has been cleared",
    });
  };

  const playersWithNames = players.filter(p => p.name.trim());
  const playersWithEmails = players.filter(p => p.email.trim());

  const ModalContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Add Players</h3>
          <p className="text-sm text-muted-foreground">
            {players.length} of {maxPlayers} players added
          </p>
        </div>
        {players.length > 0 && (
          <Button 
            onClick={handleClearAll} 
            variant="outline" 
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            Clear All
          </Button>
        )}
      </div>

      {isMobile ? (
        // Mobile: Simple tabs with Quick Add and Contacts only
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Manual Add
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Contact className="h-4 w-4" />
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <QuickAddForm onAddPlayer={handleAddPlayer} />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contact className="h-5 w-5" />
                  Import from Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact import feature coming soon. Use Manual Add for now.
                </p>
                <Button variant="outline" disabled>
                  Access Contacts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        // Desktop: Full tabs with all options
        <Tabs defaultValue="roster" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roster" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Roster
            </TabsTrigger>
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Quick Add
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk Import
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Contact className="h-4 w-4" />
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Load from Roster
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoadFromRosterTab
                  onAddPlayers={handleAddPlayers}
                  existingPlayerEmails={players.map(p => p.email)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4">
            <QuickAddForm onAddPlayer={handleAddPlayer} />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Import Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BulkPlayerImport onAddPlayers={handleAddPlayers} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contact className="h-5 w-5" />
                  Import from Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact import feature coming soon. Use Quick Add or Bulk Import for now.
                </p>
                <Button variant="outline" disabled>
                  Access Contacts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {players.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Current Players</h4>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>{playersWithNames.length} with names</span>
              <span>•</span>
              <span>{playersWithEmails.length} with emails</span>
            </div>
          </div>
          
          <div className="grid gap-3 max-h-60 overflow-y-auto">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onUpdate={handleUpdatePlayer}
                onRemove={handleRemovePlayer}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <Button 
          onClick={() => setIsOpen(false)} 
          variant="outline" 
          className="flex-1"
        >
          Done
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Player Management</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ModalContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Player Management</DialogTitle>
        </DialogHeader>
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
};

export default PlayerManagementModal;