
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
  Shield,
  UserPlus,
  Building,
  Mail,
  User,
  Loader2
} from 'lucide-react';
import { useGroupsAndAdmins } from '@/hooks/useGroupsAndAdmins';

export const ManageAdmins: React.FC = () => {
  const {
    groups,
    admins,
    loading,
    createGroup,
    createAdmin,
    updateAdmin,
    deleteAdmin
  } = useGroupsAndAdmins();

  const [newGroupName, setNewGroupName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [selectedGroupForAdmin, setSelectedGroupForAdmin] = useState('');
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [editAdminUsername, setEditAdminUsername] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
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

  const handleEditAdmin = (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    if (admin) {
      setEditingAdmin(adminId);
      setEditAdminUsername(admin.username);
      setEditAdminEmail(admin.email);
    }
  };

  const handleSaveAdminEdit = async () => {
    if (!editAdminUsername.trim() || !editAdminEmail.trim() || !editingAdmin) return;

    try {
      await updateAdmin(editingAdmin, { 
        username: editAdminUsername, 
        email: editAdminEmail 
      });
      setEditingAdmin(null);
      setEditAdminUsername('');
      setEditAdminEmail('');
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

  const toggleAdminStatus = async (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    if (admin) {
      const newStatus = admin.status === 'active' ? 'inactive' : 'active';
      try {
        await updateAdmin(adminId, { status: newStatus });
      } catch (error) {
        // Error is handled in the hook
      }
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
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Admins</h1>
          <p className="text-muted-foreground">
            Create and manage admin accounts and group assignments
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
              <UserPlus className="h-5 w-5" />
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

      {/* Groups Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Groups Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {groups.map((group) => (
              <div key={group.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{group.name}</h3>
                  <Badge variant={group.adminId ? 'default' : 'secondary'}>
                    {group.adminId ? 'Active' : 'No Admin'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Admin: {group.adminName || 'Unassigned'}</p>
                  <p>Students: {group.studentCount}</p>
                </div>
              </div>
            ))}
            {groups.length === 0 && (
              <p className="text-center text-muted-foreground py-4 col-span-3">No groups found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admins Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Admins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  {editingAdmin === admin.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={editAdminUsername}
                          onChange={(e) => setEditAdminUsername(e.target.value)}
                          placeholder="Username"
                          className="max-w-xs"
                        />
                        <Input
                          value={editAdminEmail}
                          onChange={(e) => setEditAdminEmail(e.target.value)}
                          placeholder="Email"
                          className="max-w-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveAdminEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingAdmin(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <h3 className="font-medium">{admin.username}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {admin.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {admin.groupName || 'No group'}
                        </div>
                        <span>Created: {new Date(admin.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                    {admin.status}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleAdminStatus(admin.id)}>
                    {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditAdmin(admin.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
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
