import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Sun, 
  Moon, 
  Trophy, 
  Upload, 
  Bell,
  BarChart3,
  Users,
  Settings,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { XPProgress } from '@/components/ui/xp-progress';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'student':
        return [
          { to: '/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
          { to: '/submit-project', icon: Upload, label: 'Submit Project' },
          { to: '/meets', icon: Bell, label: 'Meets' },
        ];
      case 'admin':
        return [
          { to: '/admin', icon: Home, label: 'Dashboard' },
          { to: '/admin/students', icon: Users, label: 'Students' },
          { to: '/admin/tasks', icon: Settings, label: 'Tasks' },
          { to: '/admin/xp', icon: Trophy, label: 'Give XP' },
          { to: '/meets', icon: Bell, label: 'Meets' },
          { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        ];
      case 'superadmin':
        return [
          { to: '/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/superadmin/admins', icon: Users, label: 'Admins' },
          { to: '/superadmin/analytics', icon: BarChart3, label: 'Analytics' },
          { to: '/meets', icon: Bell, label: 'Meets' },
          { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            🎓 Master Tutor
          </div>
          {user.groupName && (
            <div className="text-sm text-muted-foreground">
              {user.groupName}
            </div>
          )}
        </div>

        <div className="flex-1 mx-8">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:block">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user.role === 'student' && user.xp !== undefined && user.level !== undefined && (
            <div className="hidden lg:block w-48">
              <XPProgress currentXP={user.xp} level={user.level} />
            </div>
          )}

          <div className="text-sm">
            <div className="font-medium">{user.username}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {user.role}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};