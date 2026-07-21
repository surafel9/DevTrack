import React, { useEffect, useState } from 'react';
import { Mail, Shield, User as UserIcon, Folder } from 'lucide-react';
import { usersApi } from '../../api/endpoints';
import type { User } from '../../types/models';
import { PageContainer, PageHeader, Toolbar } from '../../components/layout/PageLayout';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { Search } from 'lucide-react';

export function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Note: The /users endpoint needs to be implemented on the backend to fetch all company employees
    // and include their role and project memberships.
    usersApi
      .list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setUsers(data);
        setFiltered(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 404) {
          setError('The team endpoint is currently not implemented on the backend. Please add the /api/users endpoint.');
        } else if (err.response?.status === 403) {
           setError('You do not have permission to view the team.');
        } else {
          setError('Failed to load team members.');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? users.filter(
            (u) =>
              u.name.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              (u.role && u.role.toLowerCase().includes(q))
          )
        : users
    );
  }, [search, users]);

  return (
    <PageContainer>
      <PageHeader
        title="Team"
        description="View all company employees and their roles."
      />

      <Toolbar
        left={
          <div className="w-full max-w-[320px]">
            <Input
              placeholder="Search members..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
        right={
          <span className="text-sm text-gray-500">
            {!isLoading && !error && `${filtered.length} member${filtered.length !== 1 ? 's' : ''}`}
          </span>
        }
      />

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-2xl bg-white">
          <EmptyState
            title={search ? 'No team members found' : 'No team members yet'}
            description={search ? `No members match "${search}"` : 'Team members will appear here once added.'}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Avatar name={user.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 flex-shrink-0">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 flex-shrink-0">
                        <UserIcon className="h-3 w-3" /> Employee
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {user.projects && user.projects.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">Projects</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {user.projects.slice(0, 3).map(p => (
                      <span key={p.id} className="text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-100 rounded px-2 py-0.5">
                        {p.name}
                      </span>
                    ))}
                    {user.projects.length > 3 && (
                      <span className="text-[11px] font-medium text-gray-400">
                        +{user.projects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
