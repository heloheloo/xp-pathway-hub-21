import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Plus, Users, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Meet {
  id: string;
  title: string;
  description: string;
  meet_type: string;
  scheduled_date: string;
  duration_minutes: number;
  status: string;
  meet_link: string | null;
  admin_id: string;
  group_id: string | null;
  groups?: { name: string };
  profiles?: { username: string };
}

interface Group {
  id: string;
  name: string;
}

const meetTypeLabels = {
  bi_monthly_meet: "Bi-Monthly Meet",
  doubt_clearing: "Doubt Clearing",
  group_project: "Group Project",
  discussion_forum: "Discussion Forum",
  project_presentation: "Project Presentation"
};

const statusColors = {
  scheduled: "bg-blue-500",
  ongoing: "bg-green-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500"
};

export const Meets: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meets, setMeets] = useState<Meet[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMeet, setNewMeet] = useState({
    title: '',
    description: '',
    meet_type: '',
    group_id: '',
    scheduled_date: '',
    duration_minutes: 60,
    meet_link: ''
  });

  useEffect(() => {
    fetchMeets();
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchMeets = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('meets')
        .select(`
          *,
          groups(name),
          profiles(username)
        `)
        .order('scheduled_date', { ascending: false });

      // Admins see meets for their group, superadmins see all
      if (user.role === 'admin') {
        query = query.eq('group_id', user.groupId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMeets(data || []);
    } catch (error) {
      console.error('Error fetching meets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch meets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMeet = async () => {
    if (!user || !newMeet.title || !newMeet.meet_type || !newMeet.scheduled_date) return;

    try {
      const { error } = await supabase
        .from('meets')
        .insert({
          title: newMeet.title,
          description: newMeet.description,
          meet_type: newMeet.meet_type,
          group_id: newMeet.group_id || user.groupId,
          admin_id: user.id,
          scheduled_date: newMeet.scheduled_date,
          duration_minutes: newMeet.duration_minutes,
          meet_link: newMeet.meet_link
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meet scheduled successfully"
      });

      setIsCreateDialogOpen(false);
      setNewMeet({
        title: '',
        description: '',
        meet_type: '',
        group_id: '',
        scheduled_date: '',
        duration_minutes: 60,
        meet_link: ''
      });
      fetchMeets();
    } catch (error) {
      console.error('Error creating meet:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meet",
        variant: "destructive"
      });
    }
  };

  const updateMeetStatus = async (meetId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('meets')
        .update({ status })
        .eq('id', meetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Meet status updated to ${status}`
      });

      fetchMeets();
    } catch (error) {
      console.error('Error updating meet status:', error);
      toast({
        title: "Error",
        description: "Failed to update meet status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meets</h1>
          <p className="text-muted-foreground">Schedule and manage learning sessions</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Meet</DialogTitle>
                <DialogDescription>Create a new learning session for your group</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newMeet.title}
                    onChange={(e) => setNewMeet({ ...newMeet, title: e.target.value })}
                    placeholder="Enter meet title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMeet.description}
                    onChange={(e) => setNewMeet({ ...newMeet, description: e.target.value })}
                    placeholder="Describe the meet agenda and objectives"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meet_type">Meet Type</Label>
                    <Select onValueChange={(value) => setNewMeet({ ...newMeet, meet_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meet type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(meetTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {user?.role === 'superadmin' && (
                    <div>
                      <Label htmlFor="group_id">Group</Label>
                      <Select onValueChange={(value) => setNewMeet({ ...newMeet, group_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_date">Date & Time</Label>
                    <Input
                      id="scheduled_date"
                      type="datetime-local"
                      value={newMeet.scheduled_date}
                      onChange={(e) => setNewMeet({ ...newMeet, scheduled_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newMeet.duration_minutes}
                      onChange={(e) => setNewMeet({ ...newMeet, duration_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="meet_link">Meet Link (optional)</Label>
                  <Input
                    id="meet_link"
                    value={newMeet.meet_link}
                    onChange={(e) => setNewMeet({ ...newMeet, meet_link: e.target.value })}
                    placeholder="https://meet.google.com/... or Zoom link"
                  />
                </div>
                <Button onClick={createMeet} className="w-full">Schedule Meet</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {meets.map((meet) => (
          <Card key={meet.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {meet.title}
                    <Badge variant="outline">
                      {meetTypeLabels[meet.meet_type as keyof typeof meetTypeLabels]}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">{meet.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`${statusColors[meet.status as keyof typeof statusColors]} text-white`}
                  >
                    {meet.status}
                  </Badge>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && meet.status === 'scheduled' && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateMeetStatus(meet.id, 'ongoing')}
                      >
                        Start
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateMeetStatus(meet.id, 'completed')}
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(meet.scheduled_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(meet.scheduled_date).toLocaleTimeString()} ({meet.duration_minutes}m)
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {meet.groups?.name || 'All Groups'}
                </div>
              </div>
              
              {meet.meet_link && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href={meet.meet_link} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      Join Meet
                    </a>
                  </Button>
                </div>
              )}
              
              <div className="mt-4 text-sm text-muted-foreground">
                Organized by {meet.profiles?.username}
              </div>
            </CardContent>
          </Card>
        ))}

        {meets.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No meets scheduled</h3>
              <p className="text-muted-foreground text-center mb-4">
                {user?.role === 'student' 
                  ? "No upcoming learning sessions. Check back later!"
                  : "Schedule your first learning session with your group"
                }
              </p>
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Meet
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};