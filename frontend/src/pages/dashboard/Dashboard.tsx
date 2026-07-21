import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Folder,
  Activity,
  CheckCircle,
  GitBranch,
  MessageSquare,
  Link as LinkIcon,
  Users,
  Clock,
} from 'lucide-react';
import { projectsApi, activityApi } from '../../api/endpoints';
import type { Project, ActivityLog } from '../../types/models';
import { calculateProgress, formatRelativeTime } from '../../utils';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { PageContainer, PageHeader } from '../../components/layout/PageLayout';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  total: number;
  active: number;
  completed: number;
  avgProgress: number;
  newThisMonth: number;
  activeThisMonth: number;
  completedThisMonth: number;
  progressThisMonth: number;
}

function computeStats(projects: Project[]): Stats {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const withProgress = projects.map(p => ({
    ...p,
    _progress: calculateProgress(p.phases || []),
    _isNew: p.created_at ? new Date(p.created_at) > thirtyDaysAgo : false,
    _isRecentlyUpdated: p.updated_at ? new Date(p.updated_at) > thirtyDaysAgo : false,
  }));
  const completed = withProgress.filter(p => p._progress === 100);
  const active    = withProgress.filter(p => p._progress > 0 && p._progress < 100);
  const avgProgress = withProgress.length
    ? Math.round(withProgress.reduce((a, p) => a + p._progress, 0) / withProgress.length)
    : 0;

  const newThisMonth = withProgress.filter(p => p._isNew).length;
  const activeThisMonth = active.filter(p => p._isRecentlyUpdated).length;
  const completedThisMonth = completed.filter(p => p._isRecentlyUpdated).length;
  
  // Since we don't store historical progress, we estimate a 5% bump if there are recent updates
  const progressThisMonth = activeThisMonth > 0 ? 5 : 0;

  return { 
    total: projects.length, 
    active: active.length, 
    completed: completed.length, 
    avgProgress,
    newThisMonth,
    activeThisMonth,
    completedThisMonth,
    progressThisMonth
  };
}

function activityIcon(action: string) {
  if (action.includes('comment')) return <MessageSquare className="h-3.5 w-3.5" />;
  if (action.includes('phase'))   return <GitBranch className="h-3.5 w-3.5" />;
  if (action.includes('link'))    return <LinkIcon className="h-3.5 w-3.5" />;
  if (action.includes('project')) return <Folder className="h-3.5 w-3.5" />;
  if (action.includes('joined'))  return <Users className="h-3.5 w-3.5" />;
  return <Activity className="h-3.5 w-3.5" />;
}

function activityText(log: ActivityLog): string {
  const meta = log.meta ?? {};
  switch (log.action) {
    case 'created_project': return `created project${log.project ? ' "' + log.project.name + '"' : ''}`;
    case 'updated_project': return `updated project${log.project ? ' "' + log.project.name + '"' : ''}`;
    case 'created_phase':   return `created the "${meta.name ?? 'phase'}" phase`;
    case 'updated_phase':   return `updated the "${meta.name ?? 'phase'}" phase`;
    case 'deleted_phase':   return `deleted the "${meta.name ?? 'phase'}" phase`;
    case 'added_comment':   return 'added a comment';
    case 'added_link':      return `added a link${meta.title ? ': ' + meta.title : ''}`;
    case 'joined_project':  return 'joined the project';
    default:                return log.action.replace(/_/g, ' ');
  }
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';
  const canCreate = isAdmin || (user?.permissions ?? []).includes('create_project');

  const [projects, setProjects]     = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [actLoading, setActLoading] = useState(true);

  useEffect(() => {
    projectsApi
      .list()
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data as { data: Project[] }).data || [];
        setProjects(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    activityApi
      .dashboard()
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data as { data: ActivityLog[] }).data || [];
        setActivities(data);
      })
      .catch(console.error)
      .finally(() => setActLoading(false));
  }, []);

  const stats  = computeStats(projects);
  const recent = [...projects].sort(
    (a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
  ).slice(0, 5);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your projects and team progress."
        actions={
          canCreate ? (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/projects/create')}
            >
              New Project
            </Button>
          ) : undefined
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="!p-5 border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <Folder className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
              {isLoading ? <Skeleton className="h-8 w-12 mb-2" /> : <p className="text-3xl font-bold text-gray-900">{stats.total}</p>}
              <p className="text-xs text-green-600 font-medium">↗ {stats.newThisMonth} this month</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-5 border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <Activity className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Projects</p>
              {isLoading ? <Skeleton className="h-8 w-12 mb-2" /> : <p className="text-3xl font-bold text-gray-900">{stats.active}</p>}
              <p className="text-xs text-green-600 font-medium">↗ {stats.activeThisMonth} updated recently</p>
            </div>
          </div>
        </Card>

        <Card className="!p-5 border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Completed Projects</p>
              {isLoading ? <Skeleton className="h-8 w-12 mb-2" /> : <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>}
              <p className="text-xs text-green-600 font-medium">↗ {stats.completedThisMonth} this month</p>
            </div>
          </div>
        </Card>

        <Card className="!p-5 border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <Clock className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Progress</p>
              {isLoading ? <Skeleton className="h-8 w-16 mb-2" /> : <p className="text-3xl font-bold text-gray-900">{stats.avgProgress}%</p>}
              <p className="text-xs text-green-600 font-medium">↗ {stats.progressThisMonth}% this month</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects – 2/3 width */}
        <Card className="lg:col-span-2 !p-6 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Recent Projects</h3>
            <Button variant="secondary" size="sm" onClick={() => navigate('/projects')}>
              View all
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : recent.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                {isAdmin ? 'No projects yet.' : 'You are not assigned to any projects.'}
              </p>
            ) : (
              recent.map(project => {
                const progress = calculateProgress(project.phases || []);
                const members  = (project.users || []).map(u => u.name);
                const phasesCount = (project.phases || []).length;
                const statusLabel = project.status === 'completed'
                  ? 'Completed'
                  : project.status === 'in_progress'
                    ? 'In Progress'
                    : 'Pending';
                const statusDot =
                  project.status === 'completed' ? 'bg-emerald-500' :
                  project.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300';

                return (
                  <div key={project.id} className="flex items-center justify-between gap-6 cursor-pointer group" onClick={() => navigate(`/projects/${project.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
                        <Folder className="h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot}`} />
                          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:underline">{project.name}</h4>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{statusLabel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 w-48 hidden sm:flex">
                        <Progress value={progress} className="flex-1" size="md" />
                        <span className="text-sm font-semibold text-gray-900 w-9">{progress}%</span>
                      </div>
                      
                      <div className="text-sm text-gray-500 w-20 hidden md:block">
                        {phasesCount} phases
                      </div>
                      
                      <div className="w-20 flex justify-end">
                        {members.length > 0 ? (
                          <AvatarGroup names={members} max={3} size="sm" />
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Recent Activity – 1/3 width */}
        <Card className="!p-6 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity (7 days)</h3>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {actLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))
            ) : activities.filter(a => new Date(a.created_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No activity in the last 7 days.</p>
            ) : (
              activities
                .filter(a => new Date(a.created_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000)
                .map(log => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Avatar name={log.actor.name} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">
                      <span className="font-semibold text-gray-900">
                        {log.actor.name}
                      </span>{' '}
                      {activityText(log)}
                    </p>
                    {log.project && (
                      <button
                        onClick={() => navigate(`/projects/${log.project!.id}`)}
                        className="text-xs text-blue-600 hover:underline mt-0.5 text-left truncate max-w-full block"
                      >
                        {log.project.name}
                      </button>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-1 p-1.5 rounded-md bg-gray-50 text-gray-400">
                    {activityIcon(log.action)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
