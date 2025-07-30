import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, GraduationCap, Users, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password, selectedRole);
      if (!success) {
        setError('Invalid credentials or role mismatch');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-5 w-5" />;
      case 'admin': return <Users className="h-5 w-5" />;
      case 'superadmin': return <Shield className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'student': return 'Submit projects, earn XP, and compete on leaderboards';
      case 'admin': return 'Manage your group, assign XP, and approve projects';
      case 'superadmin': return 'Full system access and administrative control';
    }
  };

  const getDemoCredentials = (role: UserRole) => {
    switch (role) {
      case 'student': return { username: 'student1', password: 'demo123' };
      case 'admin': return { username: 'admin1', password: 'demo123' };
      case 'superadmin': return { username: 'superadmin', password: 'demo123' };
    }
  };

  const fillDemoCredentials = (role: UserRole) => {
    const creds = getDemoCredentials(role);
    setUsername(creds.username);
    setPassword(creds.password);
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            🎓 Master Tutor
          </CardTitle>
          <CardDescription>
            Student-Mentor XP Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:block">Student</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:block">Admin</span>
              </TabsTrigger>
              <TabsTrigger value="superadmin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:block">Super</span>
              </TabsTrigger>
            </TabsList>

            {(['student', 'admin', 'superadmin'] as UserRole[]).map((role) => (
              <TabsContent key={role} value={role} className="space-y-4 mt-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                    {getRoleIcon(role)}
                    {role.charAt(0).toUpperCase() + role.slice(1)} Login
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getRoleDescription(role)}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fillDemoCredentials(role)}
                  >
                    Use Demo Credentials
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};