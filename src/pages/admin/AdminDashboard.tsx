import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star,
  TrendingUp,
  UserPlus,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const pendingProjects = [
  { id: 1, title: 'React Todo App', student: 'Sarah Kim', submittedAt: '2024-01-18', urgent: false },
  { id: 2, title: 'CSS Grid Layout', student: 'Mike Johnson', submittedAt: '2024-01-17', urgent: true },
  { id: 3, title: 'API Integration Project', student: 'Emma Wilson', submittedAt: '2024-01-16', urgent: true },
];

const recentActivity = [
  { type: 'approval', student: 'Alex Chen', project: 'React Todo App', xp: 50, time: '2 hours ago' },
  { type: 'submission', student: 'Sarah Kim', project: 'CSS Grid Layout', time: '4 hours ago' },
  { type: 'approval', student: 'David Lee', project: 'JavaScript Calculator', xp: 40, time: '1 day ago' },
];

const topStudents = [
  { name: 'Alex Chen', xp: 520, level: 6, trend: 'up' },
  { name: 'Sarah Kim', xp: 450, level: 5, trend: 'up' },
  { name: 'Mike Johnson', xp: 380, level: 4, trend: 'down' },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'submission': return <Upload className="h-4 w-4 text-blue-500" />;
      case 'rejection': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard 👨‍🏫
        </h1>
        <p className="text-muted-foreground">
          Manage your group: {user?.groupName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={8}
          icon={<Users className="h-4 w-4" />}
          variant="primary"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingProjects.length}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
          description="Projects awaiting review"
        />
        <StatCard
          title="Approved This Week"
          value={12}
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Group Average XP"
          value={324}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Project Reviews
            </CardTitle>
            <Link to="/admin/projects">
              <Button size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{project.title}</span>
                    {project.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    by {project.student} • {project.submittedAt}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
            {pendingProjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>All caught up!</p>
                <p className="text-sm">No pending project reviews.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStudents.map((student, index) => (
              <div key={student.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Level {student.level}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{student.xp} XP</span>
                    {getTrendIcon(student.trend)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{activity.student}</span>
                    {activity.type === 'approval' ? ' earned ' : ' submitted '}
                    <span className="font-medium">{activity.project}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                    {activity.xp && ` • +${activity.xp} XP awarded`}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link to="/admin/students">
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Student
                </Button>
              </Link>
              <Link to="/admin/projects">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Review Projects ({pendingProjects.length} pending)
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button className="w-full justify-start" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  View Group Leaderboard
                </Button>
              </Link>
              <Link to="/notifications">
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Send Group Announcement
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};