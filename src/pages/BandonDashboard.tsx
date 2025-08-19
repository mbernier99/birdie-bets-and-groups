import React from 'react';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Trophy, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BandonDashboard: React.FC = () => {
  const { user } = useMockAuth();
  const navigate = useNavigate();

  const bandonCourses = [
    { name: 'Pacific Dunes', par: 71, description: 'Dramatic oceanfront course' },
    { name: 'Bandon Dunes', par: 72, description: 'Original championship course' },
    { name: 'Old Macdonald', par: 71, description: 'CB Macdonald inspired design' },
    { name: 'Bandon Trails', par: 71, description: 'Parkland style through dunes' },
    { name: 'Sheep Ranch', par: 72, description: 'Scenic clifftop experience' },
  ];

  const mockTournaments = [
    {
      id: 'bandon-test-1',
      name: 'Bandon Test — Pacific Dunes (Black)',
      course: 'Pacific Dunes',
      participants: 8,
      status: 'draft',
      date: '2024-03-15'
    },
    {
      id: 'test-2',
      name: 'Old Mac Challenge',
      course: 'Old Macdonald',
      participants: 6,
      status: 'active',
      date: '2024-03-16'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/lovable-uploads/cdf100e9-eefe-430d-af52-ca910ea2ab6b.png)` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <img 
              src="/lovable-uploads/8a170a6f-1cbf-4b56-88ed-9b83f0b5c59d.png" 
              alt="BetLoopr" 
              className="w-24 h-24 mx-auto mb-4 drop-shadow-lg"
            />
            <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">BetLoopr</h1>
            <p className="text-xl opacity-90 drop-shadow-md">Championship Golf Betting at Bandon Dunes</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.displayName}</h2>
            <p className="text-muted-foreground">Ready for your next round?</p>
          </div>
          
          {user?.role === 'organizer' && (
            <Button onClick={() => navigate('/create-tournament')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Tournament
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Location</span>
              </div>
              <p className="font-semibold">Bandon, OR</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Courses</span>
              </div>
              <p className="font-semibold">{bandonCourses.length} Available</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Players</span>
              </div>
              <p className="font-semibold">12 Active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tournaments</span>
              </div>
              <p className="font-semibold">{mockTournaments.length} Active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Tournaments */}
          <Card>
            <CardHeader>
              <CardTitle>My Tournaments</CardTitle>
              <CardDescription>Your current and upcoming tournaments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTournaments.map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{tournament.name}</h4>
                    <p className="text-sm text-muted-foreground">{tournament.course}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={tournament.status === 'active' ? 'default' : 'secondary'}>
                        {tournament.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tournament.participants} players
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/tournament/${tournament.id}`)}>
                    View
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bandon Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Bandon Dunes Courses</CardTitle>
              <CardDescription>Championship courses available for tournaments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bandonCourses.map((course) => (
                <div key={course.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{course.name}</h4>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                  <Badge variant="outline">Par {course.par}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                <Trophy className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Join Tournament</div>
                  <div className="text-sm text-muted-foreground">Enter tournament code</div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Leaderboards</div>
                  <div className="text-sm text-muted-foreground">Current standings</div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                <MapPin className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Course Admin</div>
                  <div className="text-sm text-muted-foreground">Manage course data</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BandonDashboard;