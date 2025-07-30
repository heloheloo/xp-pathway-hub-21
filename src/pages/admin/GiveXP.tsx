import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Gift, Target, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
}

interface XPTransaction {
  id: string;
  student_id: string;
  amount: number;
  reason: string;
  transaction_type: string;
  created_at: string;
  profiles: { username: string };
}

const transactionTypes = {
  project_completion: "Project Completion",
  participation: "Participation",
  achievement: "Achievement",
  bonus: "Bonus",
  deduction: "Deduction"
};

export const GiveXP: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<XPTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGiveXPDialogOpen, setIsGiveXPDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [xpAmount, setXpAmount] = useState('');
  const [reason, setReason] = useState('');
  const [transactionType, setTransactionType] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchTransactions();
  }, [user]);

  const fetchStudents = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('username');

      // Admins see only their group students
      if (user.role === 'admin') {
        query = query.eq('group_id', user.groupId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      });
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('xp_transactions')
        .select(`
          *,
          profiles!xp_transactions_student_id_fkey(username)
        `)
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const giveXP = async () => {
    if (!user || !selectedStudent || !xpAmount || !reason || !transactionType) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseInt(xpAmount);
    if (isNaN(amount) || amount === 0) {
      toast({
        title: "Error",
        description: "Please enter a valid XP amount",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current student XP
      const { data: currentStudent, error: fetchError } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', selectedStudent)
        .single();

      if (fetchError) throw fetchError;

      const newXP = Math.max(0, currentStudent.xp + amount);

      // Update student XP
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXP })
        .eq('id', selectedStudent);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('xp_transactions')
        .insert({
          student_id: selectedStudent,
          admin_id: user.id,
          amount: amount,
          reason: reason,
          transaction_type: transactionType
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: `${amount > 0 ? 'Awarded' : 'Deducted'} ${Math.abs(amount)} XP successfully`
      });

      // Reset form
      setSelectedStudent('');
      setXpAmount('');
      setReason('');
      setTransactionType('');
      setIsGiveXPDialogOpen(false);

      // Refresh data
      fetchStudents();
      fetchTransactions();
    } catch (error) {
      console.error('Error giving XP:', error);
      toast({
        title: "Error",
        description: "Failed to process XP transaction",
        variant: "destructive"
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'project_completion': return <Target className="h-4 w-4" />;
      case 'participation': return <TrendingUp className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'bonus': return <Gift className="h-4 w-4" />;
      case 'deduction': return <TrendingUp className="h-4 w-4 rotate-180" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Student XP</h1>
          <p className="text-muted-foreground">Award or deduct XP points for your students</p>
        </div>
        <Dialog open={isGiveXPDialogOpen} onOpenChange={setIsGiveXPDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Give XP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Give XP to Student</DialogTitle>
              <DialogDescription>Award or deduct XP points for student performance</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="student">Select Student</Label>
                <Select onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.username} (Level {student.level} - {student.xp} XP)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transaction_type">Transaction Type</Label>
                <Select onValueChange={setTransactionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(transactionTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">XP Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(e.target.value)}
                  placeholder="Enter XP amount (use negative for deduction)"
                />
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you're giving/deducting XP"
                />
              </div>
              <Button onClick={giveXP} className="w-full">
                Process XP Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Students</CardTitle>
            <CardDescription>Current XP and levels for your group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{student.username}</div>
                    <div className="text-sm text-muted-foreground">{student.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{student.xp} XP</div>
                    <Badge variant="outline">Level {student.level}</Badge>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No students found in your group
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent XP Transactions</CardTitle>
            <CardDescription>Your recent XP awards and deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.profiles.username}</div>
                      <div className="text-sm text-muted-foreground">{transaction.reason}</div>
                      <Badge variant="secondary" className="text-xs">
                        {transactionTypes[transaction.transaction_type as keyof typeof transactionTypes]}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} XP
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No XP transactions yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};