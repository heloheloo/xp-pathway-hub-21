
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navbar } from "./components/layout/Navbar";
import { Login } from "./pages/Login";
import { StudentDashboard } from "./pages/student/Dashboard";
import { SubmitProject } from "./pages/student/SubmitProject";
import { Leaderboard } from "./pages/Leaderboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageStudents } from "./pages/admin/ManageStudents";
import { SuperAdminDashboard } from "./pages/superadmin/SuperAdminDashboard";
import { ManageAdmins } from "./pages/superadmin/ManageAdmins";
import { Analytics } from "./pages/superadmin/Analytics";
import { AdminTasks } from "./pages/admin/AdminTasks";
import { GiveXP } from "./pages/admin/GiveXP";
import { Meets } from "./pages/Meets";
import NotFound from "./pages/NotFound";

// Add debug logging
console.log("App.tsx loaded successfully");
console.log("Supabase client available:", !!window);

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  console.log("AppRoutes - Current user:", user);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user?.role === 'student' ? <StudentDashboard /> : 
             user?.role === 'admin' ? <AdminDashboard /> : 
             user?.role === 'superadmin' ? <SuperAdminDashboard /> :
             <div>Unauthorized</div>}
          </ProtectedRoute>
        } />
        <Route path="/submit-project" element={
          <ProtectedRoute><SubmitProject /></ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute><Leaderboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute><ManageStudents /></ProtectedRoute>
        } />
        <Route path="/admin/tasks" element={
          <ProtectedRoute><AdminTasks /></ProtectedRoute>
        } />
        <Route path="/admin/xp" element={
          <ProtectedRoute><GiveXP /></ProtectedRoute>
        } />
        <Route path="/meets" element={
          <ProtectedRoute><Meets /></ProtectedRoute>
        } />
        <Route path="/superadmin/admins" element={
          <ProtectedRoute><ManageAdmins /></ProtectedRoute>
        } />
        <Route path="/superadmin/analytics" element={
          <ProtectedRoute><Analytics /></ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
