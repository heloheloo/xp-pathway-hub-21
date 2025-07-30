import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  Trophy, 
  Upload, 
  TrendingUp, 
  Activity,
  Target,
  Calendar,
  Award
} from 'lucide-react';

// Simple StatCard component
const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>;
  trend: 'up' | 'down';
}> = ({ title, value, change, icon: Icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'} mt-1`}>
        {change} from last month
      </p>
    </CardContent>
  </Card>
);

// Mock analytics data
const groupData = [
  { name: 'Group 1', students: 12, totalXP: 2840, avgXP: 237, projects: 28 },
  { name: 'Group 2', students: 8, totalXP: 1920, avgXP: 240, projects: 19 },
  { name: 'Group 3', students: 15, totalXP: 3450, avgXP: 230, projects: 34 },
  { name: 'Group 4', students: 10, totalXP: 2100, avgXP: 210, projects: 22 },
  { name: 'Group 5', students: 9, totalXP: 2250, avgXP: 250, projects: 20 },
];

const monthlyData = [
  { month: 'Jan', projects: 12, xpAwarded: 600, activeUsers: 25 },
  { month: 'Feb', projects: 18, xpAwarded: 890, activeUsers: 32 },
  { month: 'Mar', projects: 24, xpAwarded: 1200, activeUsers: 38 },
  { month: 'Apr', projects: 31, xpAwarded: 1550, activeUsers: 42 },
  { month: 'May', projects: 28, xpAwarded: 1400, activeUsers: 45 },
  { month: 'Jun', projects: 35, xpAwarded: 1750, activeUsers: 48 },
];

const projectStatusData = [
  { name: 'Approved', value: 85, color: '#22c55e' },
  { name: 'Pending', value: 12, color: '#eab308' },
  { name: 'Rejected', value: 8, color: '#ef4444' },
];

const levelDistribution = [
  { level: 'Level 1', count: 15 },
  { level: 'Level 2', count: 12 },
  { level: 'Level 3', count: 8 },
  { level: 'Level 4', count: 6 },
  { level: 'Level 5', count: 3 },
];

export const Analytics: React.FC = () => {
  const totalStudents = groupData.reduce((sum, group) => sum + group.students, 0);
  const totalProjects = groupData.reduce((sum, group) => sum + group.projects, 0);
  const totalXP = groupData.reduce((sum, group) => sum + group.totalXP, 0);
  const avgXPPerStudent = Math.round(totalXP / totalStudents);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <BarChart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            System-wide performance metrics and insights
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents.toString()}
          change="+12%"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Total Projects"
          value={totalProjects.toString()}
          change="+8%"
          icon={Upload}
          trend="up"
        />
        <StatCard
          title="Total XP Awarded"
          value={totalXP.toLocaleString()}
          change="+15%"
          icon={Trophy}
          trend="up"
        />
        <StatCard
          title="Avg XP per Student"
          value={avgXPPerStudent.toString()}
          change="+3%"
          icon={Target}
          trend="up"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Group Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={groupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgXP" fill="#8884d8" name="Avg XP" />
                <Bar dataKey="projects" fill="#82ca9d" name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="projects" stroke="#8884d8" name="Projects" />
                <Line type="monotone" dataKey="xpAwarded" stroke="#82ca9d" name="XP Awarded" />
                <Line type="monotone" dataKey="activeUsers" stroke="#ffc658" name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Student Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levelDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="level" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Group Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detailed Group Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Group</th>
                  <th className="text-left p-4">Students</th>
                  <th className="text-left p-4">Total XP</th>
                  <th className="text-left p-4">Avg XP</th>
                  <th className="text-left p-4">Projects</th>
                  <th className="text-left p-4">Avg Projects/Student</th>
                </tr>
              </thead>
              <tbody>
                {groupData.map((group, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{group.name}</td>
                    <td className="p-4">{group.students}</td>
                    <td className="p-4">{group.totalXP.toLocaleString()}</td>
                    <td className="p-4">{group.avgXP}</td>
                    <td className="p-4">{group.projects}</td>
                    <td className="p-4">{(group.projects / group.students).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">New Projects</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">XP Awarded</span>
                <span className="font-medium">1,150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Students</span>
                <span className="font-medium">42</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">New Projects</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">XP Awarded</span>
                <span className="font-medium">4,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">New Students</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Group 3</span>
                <span className="font-medium">Most XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Group 5</span>
                <span className="font-medium">Highest Avg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Group 3</span>
                <span className="font-medium">Most Projects</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};