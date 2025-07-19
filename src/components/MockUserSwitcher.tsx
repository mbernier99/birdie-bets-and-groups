
import React, { useState } from 'react';
import { User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MOCK_MODE, mockUsers, getCurrentMockUser, setCurrentMockUser } from '@/utils/mockData';

const MockUserSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = getCurrentMockUser();

  if (!MOCK_MODE) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200">
            <User className="h-4 w-4 mr-2" />
            {currentUser.first_name} {currentUser.last_name}
            <Badge variant="secondary" className="ml-2 bg-yellow-200 text-yellow-800">
              TEST
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-2">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-4 w-4" />
              <span className="font-semibold">Switch Test User</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Testing mode - switch between users to test different perspectives
            </p>
          </div>
          <DropdownMenuSeparator />
          {mockUsers.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onClick={() => setCurrentMockUser(user.id)}
              className={`flex flex-col items-start space-y-1 p-3 ${
                currentUser.id === user.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium">
                {user.first_name} {user.last_name}
                {currentUser.id === user.id && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Current
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-600">
                Handicap: {user.handicap} • {user.home_course}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MockUserSwitcher;
