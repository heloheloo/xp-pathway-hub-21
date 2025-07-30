
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Group {
  id: string;
  name: string;
  adminId: string;
  adminName: string;
  studentCount: number;
  description?: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  groupId: string;
  groupName: string;
  createdAt: string;
  status: string;
}

export const useGroupsAndAdmins = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchGroupsAndAdmins = async () => {
    try {
      setLoading(true);
      console.log('Starting fetchGroupsAndAdmins...');

      // Fetch groups with admin info - simplified query to avoid recursion
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          admin_id,
          created_at
        `);

      console.log('Groups fetch result:', { groupsData, groupsError });

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        toast({
          title: "Error",
          description: "Failed to fetch teams from database",
          variant: "destructive",
        });
        return;
      }

      // Fetch admins with group info - simplified to avoid recursion
      const { data: adminsData, error: adminsError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          group_id,
          created_at,
          status
        `)
        .eq('role', 'admin');

      console.log('Admins fetch result:', { adminsData, adminsError });

      if (adminsError) {
        console.error('Error fetching admins:', adminsError);
        toast({
          title: "Error", 
          description: "Failed to fetch admins from database",
          variant: "destructive",
        });
        return;
      }

      // Process groups data
      const processedGroups = await Promise.all(
        (groupsData || []).map(async (group) => {
          // Get student count for this group
          const { data: studentCountData } = await supabase
            .rpc('get_group_student_count', { group_uuid: group.id });

          // Get admin username separately if admin_id exists
          let adminName = '';
          if (group.admin_id) {
            const { data: adminData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', group.admin_id)
              .single();
            adminName = adminData?.username || '';
          }

          return {
            id: group.id,
            name: group.name,
            adminId: group.admin_id || '',
            adminName: adminName,
            studentCount: studentCountData || 0,
            description: group.description,
            createdAt: group.created_at,
          };
        })
      );

      // Process admins data - get group names separately
      const processedAdmins = await Promise.all(
        (adminsData || []).map(async (admin) => {
          let groupName = '';
          if (admin.group_id) {
            const groupData = groupsData?.find(g => g.id === admin.group_id);
            groupName = groupData?.name || '';
          }
          
          return {
            id: admin.id,
            username: admin.username,
            email: admin.email || '',
            groupId: admin.group_id || '',
            groupName: groupName,
            createdAt: admin.created_at,
            status: admin.status || 'active',
          };
        })
      );

      setGroups(processedGroups);
      setAdmins(processedAdmins);
    } catch (error) {
      console.error('Error in fetchGroupsAndAdmins:', error);
      toast({
        title: "Error",
        description: "Failed to load groups and admins data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Teams are now pre-created, so we don't need manual group creation
  // But we keep the function for backward compatibility
  const createGroup = async (name: string, description?: string) => {
    try {
      console.log('Creating group with:', { name, description, user: user?.id });
      
      const { data, error } = await supabase
        .from('groups')
        .insert([{ name, description }])
        .select()
        .single();

      if (error) {
        console.error('Group creation error:', error);
        throw error;
      }

      console.log('Group created successfully:', data);

      toast({
        title: "Team created",
        description: `${name} has been created successfully`,
      });

      fetchGroupsAndAdmins(); // Refresh data
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateGroup = async (groupId: string, updates: { name?: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Group updated",
        description: "Group has been updated successfully",
      });

      fetchGroupsAndAdmins(); // Refresh data
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Group deleted",
        description: "Group has been removed successfully",
      });

      fetchGroupsAndAdmins(); // Refresh data
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createAdmin = async (username: string, email: string, groupId: string, password: string) => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, role: 'admin' }
      });

      if (authError) throw authError;

      // Then create the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: authData.user.id,
          username,
          email,
          role: 'admin',
          group_id: groupId,
          status: 'active'
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Admin created",
        description: `${username} has been created and assigned to the group`,
      });

      fetchGroupsAndAdmins(); // Refresh data
      return profileData;
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: "Failed to create admin",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAdmin = async (adminId: string, updates: { username?: string; email?: string; status?: string }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Admin updated",
        description: "Admin details have been updated successfully",
      });

      fetchGroupsAndAdmins(); // Refresh data
    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        title: "Error",
        description: "Failed to update admin",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAdmin = async (adminId: string) => {
    try {
      // First get the admin's user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', adminId)
        .single();

      if (profile) {
        // Delete the auth user (this will cascade to profile due to foreign key)
        const { error: authError } = await supabase.auth.admin.deleteUser(profile.user_id);
        if (authError) throw authError;
      }

      toast({
        title: "Admin removed",
        description: "Admin has been removed from the system",
      });

      fetchGroupsAndAdmins(); // Refresh data
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: "Error",
        description: "Failed to delete admin",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchGroupsAndAdmins();

    // Only set up subscriptions for non-UI-only users
    if (user?.id !== 'superadmin-ui-only') {
      // Set up real-time subscriptions
      const profilesSubscription = supabase
        .channel('profiles-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchGroupsAndAdmins();
        })
        .subscribe();

      const groupsSubscription = supabase
        .channel('groups-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
          fetchGroupsAndAdmins();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(profilesSubscription);
        supabase.removeChannel(groupsSubscription);
      };
    }
  }, [user]);

  return {
    groups,
    admins,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    refreshData: fetchGroupsAndAdmins
  };
};
