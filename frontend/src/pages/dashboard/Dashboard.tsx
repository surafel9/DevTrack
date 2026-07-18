import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, Activity, CheckCircle, Clock } from 'lucide-react';
import { projectsApi } from '../../api/endpoints';
import type { Project } from '../../types/models';
import { calculateProgress, formatRelativeTime } from '../../utils';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { PageContainer, PageHeader } from '../../components/layout/PageLayout';
import { Skeleton } from '../../components/ui/Skeleton';

interface Stats {
  total: number;
  active: number;
  completed: number;
  avgProgress: number;
}

function computeStats(projects: Project[]): Stats {
  const withPhases = projects.map((p) => ({
    ...p,
    progress: calculateProgress(p.phases || []),
  }));

  const completed = withPhases.filter((p) => p.progress === 100).length;
  const active = withPhases.filter((p) => p.progress > 0 && p.progress < 100).length;
  const avgProgress = withPhases.length
    ? Math.round(withPhases.reduce((a, p) => a + p.progress, 0) / withPhases.length)
    : 0;

  return { total: projects.length, active, completed, avgProgress };
}

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    projectsApi
      .list()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data as { data: Project[] }).data || [];
        setProjects(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = computeStats(projects);
  const recent = projects.slice(0, 5); // Limit to 5 for the layout

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your projects and team progress."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/projects/create')}>
            New Project
          </Button>
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
              <p className="text-xs text-green-600 font-medium">↗ 2 this month</p>
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
              <p className="text-xs text-green-600 font-medium">↗ 1 this week</p>
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
              <p className="text-xs text-green-600 font-medium">↗ 3 this month</p>
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
              <p className="text-xs text-green-600 font-medium">↗ 8% this month</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Projects */}
        <Card className="lg:col-span-2 !p-6 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Recent Projects</h3>
            <Button variant="secondary" size="sm" onClick={() => navigate('/projects')}>View all projects</Button>
          </div>
          
          <div className="space-y-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : recent.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No recent projects.</p>
            ) : (
              recent.map((project) => {
                const progress = calculateProgress(project.phases || []);
                const members = (project.users || []).map((u) => u.name);
                const phasesCount = (project.phases || []).length;
                
                return (
                  <div key={project.id} className="flex items-center justify-between gap-6 cursor-pointer group" onClick={() => navigate(`/projects/${project.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
                        <Folder className="h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:underline">{project.name}</h4>
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

        {/* Progress Overview (Placeholder for chart) */}
        <Card className="!p-6 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Progress Overview</h3>
            <select className="text-sm bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none">
              <option>This Week</option>
            </select>
          </div>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Average progress across all projects</p>
            <p className="text-3xl font-bold text-gray-900">68%</p>
          </div>
          {/* Chart placeholder */}
          <div className="h-[200px] w-full border border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
            <p className="text-sm text-gray-400">Chart goes here</p>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tasks Overview */}
        <Card className="!p-6 border-gray-200">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900">Tasks Overview</h3>
            <p className="text-sm text-gray-500">Tasks status overview</p>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="h-[180px] w-full border border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
              <p className="text-sm text-gray-400">Pie chart goes here</p>
            </div>
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="!p-6 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Upcoming Deadlines</h3>
            <Button variant="secondary" size="sm">View all</Button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">Phase Deadline {i}</h4>
                  <p className="text-xs text-gray-500 truncate">Example Project</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">May 2{i}, 2025</p>
                  <p className="text-xs text-orange-500">In {i + 1} days</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="!p-6 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="secondary" size="sm">View all</Button>
          </div>
          <div className="space-y-6">
            {[
              { name: 'John Doe', action: 'updated project progress', project: 'Hospital Management System', time: '2 hours ago' },
              { name: 'Jane Smith', action: 'added a new comment', project: 'E-commerce Platform', time: '5 hours ago' },
              { name: 'Mike Johnson', action: 'created a new phase', project: 'Learning Management System', time: '1 day ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-4">
                <Avatar name={activity.name} size="md" className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.name}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.project}</p>
                </div>
                <p className="text-xs text-gray-500 flex-shrink-0">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
