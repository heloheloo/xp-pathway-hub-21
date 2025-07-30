
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Crown,
  Shield,
  UserPlus,
  Building,
  Loader2
} from 'lucide-react';
import { useGroupsAndAdmins } from '@/hooks/useGroupsAndAdmins';

export const SuperAdminDashboard: React.FC = () => {
  const {
    groups,
    admins,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    createAdmin,
    updateAdmin,
    deleteAdmin
  } = useGroupsAndAdmins();

  const [newGroupName, setNewGroupName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [selectedGroupForAdmin, setSelectedGroupForAdmin] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    setIsCreatingGroup(true);
    try {
      await createGroup(newGroupName);
      setNewGroupName('');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminUsername.trim() || !newAdminEmail.trim() || !selectedGroupForAdmin || !newAdminPassword.trim()) {
      return;
    }

    setIsCreatingAdmin(true);
    try {
      await createAdmin(newAdminUsername, newAdminEmail, selectedGroupForAdmin, newAdminPassword);
      setNewAdminUsername('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setSelectedGroupForAdmin('');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleEditGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setEditingGroup(groupId);
      setEditGroupName(group.name);
    }
  };

  const handleSaveGroupEdit = async () => {
    if (!editGroupName.trim() || !editingGroup) return;

    try {
      await updateGroup(editingGroup, { name: editGroupName });
      setEditingGroup(null);
      setEditGroupName('');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await deleteAdmin(adminId);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Crown className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SuperAdmin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all groups, admins, and system-wide settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create New Group */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Create New Group
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Group 4"
              />
            </div>
            <Button onClick={handleCreateGroup} className="w-full" disabled={isCreatingGroup}>
              {isCreatingGroup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Create New Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Create New Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                placeholder="admin4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin4@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-group">Assign to Group</Label>
              <select
                id="admin-group"
                value={selectedGroupForAdmin}
                onChange={(e) => setSelectedGroupForAdmin(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Select a group</option>
                {groups.filter(g => !g.adminId).map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleCreateAdmin} className="w-full" disabled={isCreatingAdmin}>
              {isCreatingAdmin ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Groups Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Groups Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  {editingGroup === group.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editGroupName}
                        onChange={(e) => setEditGroupName(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button size="sm" onClick={handleSaveGroupEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingGroup(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Admin: {group.adminName || 'No admin assigned'} | Students: {group.studentCount}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={group.adminId ? 'default' : 'secondary'}>
                    {group.adminId ? 'Active' : 'No Admin'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => handleEditGroup(group.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteGroup(group.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {groups.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No groups found. Create your first group above.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admins Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admins Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{admin.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    {admin.email} | Assigned to: {admin.groupName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                    {admin.status}
                  </Badge>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteAdmin(admin.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No admins found. Create your first admin above.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
