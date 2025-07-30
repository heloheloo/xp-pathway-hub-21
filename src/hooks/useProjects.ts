
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  title: string;
  description?: string;
  project_link?: string;
  file_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  xp_awarded: number;
  student_id: string;
  admin_id?: string;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  project_link?: string;
  file?: File;
}

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching projects for user:', user.id);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log('Fetched projects:', data);
      return data as Project[];
    },
    enabled: !!user?.id,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Creating project with data:', projectData);

      // First, insert the project record
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          project_link: projectData.project_link || null,
          file_name: projectData.file?.name || null,
          student_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      console.log('Created project:', data);

      // If there's a file, update the project with file data
      if (projectData.file && data) {
        const fileBuffer = await projectData.file.arrayBuffer();
        // Convert ArrayBuffer to base64 string
        const base64String = btoa(
          new Uint8Array(fileBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({ file_data: base64String })
          .eq('id', data.id);

        if (updateError) {
          console.error('Error uploading file data:', updateError);
          // Don't throw here, project was created successfully
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({
        title: "Project submitted successfully!",
        description: "Your project has been submitted for review. You'll be notified once it's reviewed.",
      });
    },
    onError: (error) => {
      console.error('Project submission error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your project. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    projects,
    isLoading,
    createProject: createProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
  };
};
