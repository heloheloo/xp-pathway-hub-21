import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { XPProgress } from '@/components/ui/xp-progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Trophy, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star,
  TrendingUp,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data - replace with actual data fetching
const recentProjects = [
  { id: 1, title: 'React Todo App', status: 'approved', xpAwarded: 50, submittedAt: '2024-01-15' },
  { id: 2, title: 'CSS Grid Layout', status: 'pending', xpAwarded: 0, submittedAt: '2024-01-18' },
  { id: 3, title: 'JavaScript Calculator', status: 'rejected', xpAwarded: 0, submittedAt: '2024-01-10' },
];

const topPerformers = [
  { rank: 1, name: 'Alex Chen', xp: 520, badge: '👑' },
  { rank: 2, name: 'Sarah Kim', xp: 450, badge: '🥇' },
  { rank: 3, name: 'You', xp: 450, badge: '🥈', isCurrentUser: true },
];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username}! 🎉
        </h1>
        <p className="text-muted-foreground">
          Keep up the great work! You're making excellent progress.
        </p>
      </div>

      {/* XP Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <XPProgress 
            currentXP={user?.xp || 0} 
            level={user?.level || 1} 
            className="mb-4"
          />
          <div className="text-sm text-muted-foreground">
            You need {((user?.level || 1) + 1) * 100 - (user?.xp || 0)} more XP to reach Level {(user?.level || 1) + 1}!
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current XP"
          value={user?.xp || 0}
          icon={<Trophy className="h-4 w-4" />}
          variant="primary"
        />
        <StatCard
          title="Current Level"
          value={user?.level || 1}
          icon={<Star className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Projects Completed"
          value={recentProjects.filter(p => p.status === 'approved').length}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Group Rank"
          value="#3"
          icon={<TrendingUp className="h-4 w-4" />}
          variant="warning"
          description="Out of 12 students"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Recent Projects
            </CardTitle>
            <Link to="/submit-project">
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Submit New
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Submitted {project.submittedAt}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {project.xpAwarded > 0 && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                      +{project.xpAwarded} XP
                    </Badge>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(project.status)}/10 text-${getStatusColor(project.status).split('-')[1]}-500 border-${getStatusColor(project.status).split('-')[1]}-500/20`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(project.status)}
                      {project.status}
                    </div>
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Group Leaderboard Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Group Leaderboard
            </CardTitle>
            <Link to="/leaderboard">
              <Button variant="outline" size="sm">
                View Full
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((performer) => (
              <div 
                key={performer.rank} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  performer.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{performer.badge}</div>
                  <div>
                    <div className={`font-medium ${performer.isCurrentUser ? 'text-primary' : ''}`}>
                      {performer.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rank #{performer.rank}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{performer.xp} XP</div>
                  <div className="text-sm text-muted-foreground">
                    Level {Math.floor(performer.xp / 100) + 1}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/submit-project">
              <Button className="w-full h-20 flex flex-col gap-2">
                <Upload className="h-6 w-6" />
                Submit Project
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Trophy className="h-6 w-6" />
                View Leaderboard
              </Button>
            </Link>
            <Link to="/notifications">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <CheckCircle className="h-6 w-6" />
                Check Updates
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};