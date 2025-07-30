import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XPProgress } from '@/components/ui/xp-progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react';

// Mock leaderboard data
const groupLeaderboard = [
  { rank: 1, id: '1', name: 'Alex Chen', username: 'alex_chen', xp: 520, level: 6, streak: 7 },
  { rank: 2, id: '2', name: 'Sarah Kim', username: 'sarah_k', xp: 450, level: 5, streak: 5 },
  { rank: 3, id: '1', name: 'You', username: 'student1', xp: 450, level: 5, streak: 3, isCurrentUser: true },
  { rank: 4, id: '3', name: 'Mike Johnson', username: 'mike_j', xp: 380, level: 4, streak: 2 },
  { rank: 5, id: '4', name: 'Emma Wilson', username: 'emma_w', xp: 320, level: 4, streak: 4 },
  { rank: 6, id: '5', name: 'David Lee', username: 'david_l', xp: 280, level: 3, streak: 1 },
  { rank: 7, id: '6', name: 'Lisa Zhang', username: 'lisa_z', xp: 250, level: 3, streak: 6 },
  { rank: 8, id: '7', name: 'Tom Brown', username: 'tom_b', xp: 220, level: 3, streak: 2 },
];

const globalLeaderboard = [
  { rank: 1, id: '1', name: 'Jennifer Wu', username: 'jen_wu', xp: 890, level: 9, group: 'AI Masters' },
  { rank: 2, id: '2', name: 'Marcus Lee', username: 'marcus_l', xp: 750, level: 8, group: 'Full Stack Heroes' },
  { rank: 3, id: '3', name: 'Sofia Rodriguez', username: 'sofia_r', xp: 680, level: 7, group: 'Data Scientists' },
  { rank: 4, id: '4', name: 'Alex Chen', username: 'alex_chen', xp: 520, level: 6, group: 'React Masters' },
  { rank: 5, id: '5', name: 'Rachel Green', username: 'rachel_g', xp: 510, level: 6, group: 'UI/UX Designers' },
  { rank: 15, id: '1', name: 'You', username: 'student1', xp: 450, level: 5, group: 'React Masters', isCurrentUser: true },
];

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('group');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number, isCurrentUser?: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-primary/20 border';
    
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20 border';
      case 2: return 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/20 border';
      case 3: return 'bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/20 border';
      default: return 'bg-muted/30';
    }
  };

  const getBadgeEmoji = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 5) return '⭐';
    if (rank <= 10) return '🔥';
    return '💪';
  };

  const LeaderboardTable = ({ data, showGroup = false }: { data: any[], showGroup?: boolean }) => (
    <div className="space-y-3">
      {data.map((player, index) => (
        <div
          key={player.id + player.rank}
          className={`p-4 rounded-lg transition-all hover:scale-[1.02] ${getRankColor(player.rank, player.isCurrentUser)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{getBadgeEmoji(player.rank)}</div>
                <div className="text-sm font-bold text-muted-foreground">
                  #{player.rank}
                </div>
              </div>
              
              
              
              <div className="flex-1">
                <div className={`font-semibold ${player.isCurrentUser ? 'text-primary' : ''}`}>
                  {player.name}
                  {player.isCurrentUser && <Badge variant="secondary" className="ml-2">You</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  @{player.username}
                  {showGroup && ` • ${player.group}`}
                </div>
                {player.streak && (
                  <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {player.streak} day streak
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-bold text-lg">{player.xp} XP</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Level {player.level}
              </Badge>
            </div>
          </div>

          {player.isCurrentUser && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <XPProgress 
                currentXP={player.xp} 
                level={player.level} 
                showLabel={false}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Compete with your peers and climb the ranks!
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="group" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Group Leaderboard
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="group" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {user?.groupName} Group Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={groupLeaderboard} />
            </CardContent>
          </Card>

          {/* Group Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">8</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-500">2,590</div>
                <div className="text-sm text-muted-foreground">Total Group XP</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-500">#3</div>
                <div className="text-sm text-muted-foreground">Group Global Rank</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Rankings
                <Badge variant="secondary" className="ml-auto">
                  All Groups
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={globalLeaderboard} showGroup={true} />
            </CardContent>
          </Card>

          {/* Global Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">184</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-500">52,840</div>
                <div className="text-sm text-muted-foreground">Total Platform XP</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-500">22</div>
                <div className="text-sm text-muted-foreground">Active Groups</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};