import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2 } from "lucide-react";

interface ProfileHeaderProps {
  profile: {
    first_name?: string | null;
    last_name?: string | null;
    nickname?: string | null;
    handicap?: number | null;
    ghin_number?: string | null;
    avatar_url?: string | null;
  };
  stats: {
    winRate: number;
    netWinnings: number;
  };
  onAvatarClick: () => void;
}

export const ProfileHeader = ({ profile, stats, onAvatarClick }: ProfileHeaderProps) => {
  const getInitials = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return "U";
  };

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.nickname || "User";

  return (
    <div className="bg-card border-b">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg"
              onClick={onAvatarClick}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {displayName}
            </h1>
            {profile.nickname && (
              <p className="text-muted-foreground">"{profile.nickname}"</p>
            )}
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {profile.handicap !== null && profile.handicap !== undefined && (
                <div className="text-foreground">
                  <span className="text-muted-foreground">HCP:</span>{" "}
                  <span className="font-semibold">{profile.handicap}</span>
                </div>
              )}
              {profile.ghin_number && (
                <div className="flex items-center gap-1 text-foreground">
                  <span className="text-muted-foreground">GHIN:</span>{" "}
                  <span className="font-semibold">{profile.ghin_number}</span>
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <div className="text-muted-foreground">Win Rate</div>
                <div className="text-lg font-bold text-foreground">{stats.winRate}%</div>
              </div>
              <div className="border-l pl-4">
                <div className="text-muted-foreground">Net Winnings</div>
                <div className={`text-lg font-bold ${stats.netWinnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.netWinnings >= 0 ? '+' : ''}{stats.netWinnings}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
