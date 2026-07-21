import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/endpoints';
import type { User } from '../../types/models';
import { PageContainer, PageHeader } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, Save, Check, X, User as UserIcon, Lock, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';

const GLOBAL_PERMISSIONS = [
  { id: 'create_project', label: 'Create Projects', description: 'Can create new projects' },
  { id: 'manage_users', label: 'Manage Users', description: 'Can view and modify user accounts' },
  { id: 'assign_permissions', label: 'Assign Permissions', description: 'Can modify permissions for other users' },
  { id: 'manage_project_members', label: 'Manage Project Members', description: 'Can assign or remove members in projects' },
];

type TabType = 'profile' | 'security' | 'permissions';

export function Settings() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Admin section state
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [employeePermissions, setEmployeePermissions] = useState<Set<string>>(new Set());
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionSuccess, setPermissionSuccess] = useState(false);

  useEffect(() => {
    if (isAdmin && activeTab === 'permissions') {
      setIsLoadingEmployees(true);
      usersApi.list()
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : [];
          setEmployees(data);
        })
        .catch(err => {
          console.error(err);
          setPermissionError('Failed to load employees. Ensure the GET /api/users endpoint is working.');
        })
        .finally(() => setIsLoadingEmployees(false));
    }
  }, [isAdmin, activeTab]);

  const handleSelectEmployee = (emp: User) => {
    setSelectedEmployee(emp);
    setEmployeePermissions(new Set(emp.permissions || []));
    setPermissionError(null);
    setPermissionSuccess(false);
  };

  const togglePermission = (permId: string) => {
    setEmployeePermissions(prev => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleSaveProfile = async () => {
    // Fake functionality as requested if no endpoint
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }, 1000);
  };

  const handleSaveSecurity = async () => {
    if (newPassword !== confirmPassword) {
      setSecurityError('Passwords do not match');
      return;
    }
    // Fake functionality as requested if no endpoint
    setIsSavingSecurity(true);
    setSecurityError(null);
    setTimeout(() => {
      setIsSavingSecurity(false);
      setSecurityError('Password update endpoint is missing on backend.');
    }, 1000);
  };

  const handleSavePermissions = async () => {
    if (!selectedEmployee) return;
    setIsSavingPermissions(true);
    setPermissionError(null);
    setPermissionSuccess(false);

    try {
      await usersApi.updatePermissions(selectedEmployee.id, Array.from(employeePermissions));
      setPermissionSuccess(true);
      setEmployees(prev => prev.map(e => 
        e.id === selectedEmployee.id ? { ...e, permissions: Array.from(employeePermissions) } : e
      ));
      setSelectedEmployee(prev => prev ? { ...prev, permissions: Array.from(employeePermissions) } : null);
      setTimeout(() => setPermissionSuccess(false), 3000);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setPermissionError('You do not have permission to assign these permissions.');
      } else {
        setPermissionError('Failed to update permissions.');
      }
    } finally {
      setIsSavingPermissions(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your account preferences, security, and permissions."
      />

      <div className="flex flex-col md:flex-row gap-8 pb-12 mt-4">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-white shadow-sm text-gray-900 ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <UserIcon className={`h-4 w-4 ${activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400'}`} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-white shadow-sm text-gray-900 ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Lock className={`h-4 w-4 ${activeTab === 'security' ? 'text-gray-900' : 'text-gray-400'}`} />
              Security
            </button>
            
            {isAdmin && (
              <>
                <div className="pt-4 pb-2 px-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Only</span>
                </div>
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'permissions' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Shield className={`h-4 w-4 ${activeTab === 'permissions' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  Permissions
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-4xl">
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                <Avatar name={user?.name || 'User'} size="lg" className="h-14 w-14 text-lg" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">{user?.role || 'Employee'}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <Input value={user?.email || ''} disabled className="bg-gray-50 text-gray-500" />
                  <p className="text-xs text-gray-400 mt-1.5">Contact an administrator to change your email address.</p>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <Button 
                    onClick={handleSaveProfile} 
                    isLoading={isSavingProfile}
                  >
                    Save Changes
                  </Button>
                  {profileSuccess && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 animate-in fade-in slide-in-from-left-2">
                      <Check className="h-4 w-4" /> Profile updated successfully
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Update your password and secure your account.</p>
              </div>
              <div className="p-6 space-y-5 max-w-lg">
                {securityError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm flex items-start gap-2">
                    <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{securityError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <Button 
                    onClick={handleSaveSecurity} 
                    isLoading={isSavingSecurity}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isAdmin && activeTab === 'permissions' && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
              {/* Employee List */}
              <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="font-semibold text-gray-900">Employees</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Select an employee to manage</p>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {isLoadingEmployees ? (
                    <div className="p-4 text-sm text-gray-500 text-center animate-pulse">Loading employees...</div>
                  ) : employees.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">No employees found.</div>
                  ) : (
                    employees.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => handleSelectEmployee(emp)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 ${selectedEmployee?.id === emp.id ? 'bg-indigo-50 shadow-sm border border-indigo-100' : 'hover:bg-gray-100 border border-transparent'}`}
                      >
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${selectedEmployee?.id === emp.id ? 'text-indigo-900' : 'text-gray-900'}`}>{emp.name}</p>
                          <p className={`text-xs truncate ${selectedEmployee?.id === emp.id ? 'text-indigo-600' : 'text-gray-500'}`}>{emp.email}</p>
                        </div>
                        {emp.role === 'admin' && (
                          <Shield className={`h-3.5 w-3.5 flex-shrink-0 ${selectedEmployee?.id === emp.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              {/* Permissions Editor */}
              <div className="flex-1 bg-white p-6 md:p-8">
                {selectedEmployee ? (
                  <div className="max-w-xl">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedEmployee.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedEmployee.role === 'admin' 
                          ? 'This user is an admin and has full system access. Specific permissions are overridden.'
                          : 'Manage global capabilities for this employee.'}
                      </p>
                    </div>

                    {permissionError && (
                      <div className="bg-red-50 text-red-600 p-3.5 rounded-xl border border-red-100 text-sm flex items-start gap-3 mb-6">
                        <X className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>{permissionError}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {GLOBAL_PERMISSIONS.map(perm => {
                        const isChecked = employeePermissions.has(perm.id);
                        const isDisabled = selectedEmployee.role === 'admin';
                        return (
                          <div 
                            key={perm.id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                              isChecked && !isDisabled ? 'bg-indigo-50/30 border-indigo-200 shadow-sm' : 
                              isDisabled ? 'bg-gray-50 border-gray-100 opacity-75' : 
                              'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="pt-0.5">
                              {/* Custom Toggle Switch */}
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isChecked}
                                disabled={isDisabled}
                                onClick={() => togglePermission(perm.id)}
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isChecked ? 'bg-indigo-600' : 'bg-gray-200'} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-4' : 'translate-x-0'}`}
                                />
                              </button>
                            </div>
                            <div className="flex-1">
                              <label className={`text-sm font-semibold cursor-pointer ${isChecked ? 'text-indigo-900' : 'text-gray-900'} ${isDisabled ? 'cursor-not-allowed' : ''}`} onClick={() => !isDisabled && togglePermission(perm.id)}>
                                {perm.label}
                              </label>
                              <p className="text-sm text-gray-500 mt-0.5">{perm.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <Button 
                        onClick={handleSavePermissions} 
                        isLoading={isSavingPermissions}
                        disabled={selectedEmployee.role === 'admin'}
                      >
                        Save Permissions
                      </Button>
                      {permissionSuccess && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 animate-in fade-in">
                          <Check className="h-4 w-4" /> Successfully saved
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-4 py-12">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                      <Shield className="h-8 w-8 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900">No Employee Selected</p>
                      <p className="text-sm mt-1">Select an employee from the sidebar to manage their permissions.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
