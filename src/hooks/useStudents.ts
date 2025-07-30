
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth, User } from '@/contexts/AuthContext';

export interface Student {
  id: string;
  name: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  joinedAt: string;
  lastActive: string;
  status: string;
  projectsCompleted: number;
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchStudents = async () => {
    if (!user) return;

    // Type guard to ensure user has the required properties
    const authenticatedUser = user as User;
    if (!authenticatedUser.role) {
      console.error('User role not found');
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          xp,
          level,
          created_at,
          status,
          user_id
        `)
        .eq('role', 'student');

      // If user is admin (not superadmin), only show students in their group
      if (authenticatedUser.role === 'admin' && authenticatedUser.groupId) {
        query = query.eq('group_id', authenticatedUser.groupId);
      }

      const { data: studentsData, error: studentsError } = await query;

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return;
      }

      // Get project counts for each student
      const studentsWithProjects = await Promise.all(
        (studentsData || []).map(async (student) => {
          const { data: projectsData } = await supabase
            .from('projects')
            .select('id')
            .eq('student_id', student.id)
            .eq('status', 'approved');

          return {
            id: student.id,
            name: student.username, // Using username as name for now
            username: student.username,
            email: student.email || '',
            xp: student.xp || 0,
            level: student.level || 1,
            joinedAt: new Date(student.created_at).toISOString().split('T')[0],
            lastActive: 'Unknown', // TODO: implement last active tracking
            status: student.status || 'active',
            projectsCompleted: projectsData?.length || 0,
          };
        })
      );

      setStudents(studentsWithProjects);
    } catch (error) {
      console.error('Error in fetchStudents:', error);
      toast({
        title: "Error",
        description: "Failed to load students data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const authenticatedUser = user as User;

    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: studentData.email,
        password: studentData.password,
        email_confirm: true,
        user_metadata: { username: studentData.username, role: 'student' }
      });

      if (authError) throw authError;

      // Then create the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: authData.user.id,
          username: studentData.username,
          email: studentData.email,
          role: 'student',
          group_id: authenticatedUser.role === 'admin' ? authenticatedUser.groupId : null,
          status: 'active',
          xp: 0,
          level: 1
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Student added successfully!",
        description: `${studentData.name} has been added to your group.`,
      });

      fetchStudents(); // Refresh data
      return profileData;
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "Failed to add student",
        description: "There was an error adding the student. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      // First get the student's user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', studentId)
        .single();

      if (profile) {
        // Delete the auth user (this will cascade to profile due to foreign key)
        const { error: authError } = await supabase.auth.admin.deleteUser(profile.user_id);
        if (authError) throw authError;
      }

      toast({
        title: "Student removed",
        description: "The student has been removed from your group.",
      });

      fetchStudents(); // Refresh data
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudents();

      // Set up real-time subscription
      const subscription = supabase
        .channel('students-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          // Only refresh if it's a student profile change
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          if ((newRecord && newRecord.role === 'student') || (oldRecord && oldRecord.role === 'student')) {
            fetchStudents();
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
          fetchStudents(); // Refresh to update project counts
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

  return {
    students,
    loading,
    createStudent,
    deleteStudent,
    refreshData: fetchStudents
  };
};
