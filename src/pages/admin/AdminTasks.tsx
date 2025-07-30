import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, CheckCircle, Clock, Plus, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdminTask {
  id: string;
  task_type: string;
  title: string;
  description: string;
  month: number;
  year: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const taskTypeLabels = {
  bi_monthly_meet: "Bi-Monthly Meet",
  doubt_clearing: "Doubt Clearing Session",
  group_project: "Group Project",
  discussion_forum: "Discussion Forum",
  project_presentation: "Project Presentation",
  malayalam_post: "Malayalam Post",
  malayalam_challenge: "Malayalam Challenge"
};

const taskDescriptions = {
  bi_monthly_meet: "Organize two sessions each month focusing on current or essential topics",
  doubt_clearing: "Conduct regular sessions to clarify doubts related to previous sessions, projects, or general concepts",
  group_project: "Assign small teams to work on projects and introduce a friendly competition format",
  discussion_forum: "Host interactive forums where participants can discuss, debate, and share insights",
  project_presentation: "Have each group present and explain their projects to peers and mentors",
  malayalam_post: "Publish short posts or articles in Malayalam relevant to the community",
  malayalam_challenge: "Create original posts in Malayalam on relevant topics (twice monthly)"
};

export const AdminTasks: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task_type: '',
    title: '',
    description: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_tasks')
        .select('*')
        .eq('admin_id', user.id)
        .order('month', { ascending: false })
        .order('year', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!user || !newTask.task_type || !newTask.title) return;

    try {
      const { error } = await supabase
        .from('admin_tasks')
        .insert({
          admin_id: user.id,
          task_type: newTask.task_type,
          title: newTask.title,
          description: newTask.description || taskDescriptions[newTask.task_type as keyof typeof taskDescriptions],
          month: newTask.month,
          year: newTask.year
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully"
      });

      setIsCreateDialogOpen(false);
      setNewTask({
        task_type: '',
        title: '',
        description: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_tasks')
        .update({
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Task marked as ${!completed ? 'completed' : 'incomplete'}`
      });

      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthTasks = tasks.filter(task => task.month === currentMonth && task.year === currentYear);
  const completedThisMonth = currentMonthTasks.filter(task => task.completed).length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monthly Tasks</h1>
          <p className="text-muted-foreground">Track and manage your monthly admin responsibilities</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new monthly task to track your progress</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task_type">Task Type</Label>
                <Select onValueChange={(value) => setNewTask({ ...newTask, task_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(taskTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select 
                    value={newTask.month.toString()} 
                    onValueChange={(value) => setNewTask({ ...newTask, month: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {getMonthName(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newTask.year}
                    onChange={(e) => setNewTask({ ...newTask, year: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={createTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Month Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {getMonthName(currentMonth)} {currentYear} Progress
          </CardTitle>
          <CardDescription>
            {completedThisMonth} of {currentMonthTasks.length} tasks completed this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: currentMonthTasks.length > 0 ? `${(completedThisMonth / currentMonthTasks.length) * 100}%` : '0%'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={task.completed ? 'bg-muted/50' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(task.id, task.completed)}
                    className="mt-1"
                  />
                  <div>
                    <CardTitle className={`text-lg ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {taskTypeLabels[task.task_type as keyof typeof taskTypeLabels]}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {getMonthName(task.month)} {task.year}
                      </Badge>
                      {task.completed && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {task.completed && task.completed_at
                    ? `Completed ${new Date(task.completed_at).toLocaleDateString()}`
                    : `Created ${new Date(task.created_at).toLocaleDateString()}`
                  }
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{task.description}</p>
            </CardContent>
          </Card>
        ))}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first monthly task to start tracking your admin responsibilities
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};