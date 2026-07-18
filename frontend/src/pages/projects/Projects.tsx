import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Folder, ArrowRight } from 'lucide-react';
import { projectsApi } from '../../api/endpoints';
import type { Project } from '../../types/models';
import { calculateProgress } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AvatarGroup } from '../../components/ui/Avatar';
import { ProjectCardSkeleton } from '../../components/ui/Skeleton';
import { PageContainer, PageHeader, Toolbar } from '../../components/layout/PageLayout';
import { EmptyState } from '../../components/common/EmptyState';

// Simple deterministic color palette for project icons
const PROJECT_COLORS = [
  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
];

function getProjectColor(id: number) {
  return PROJECT_COLORS[id % PROJECT_COLORS.length];
}

function StatusDot({ progress }: { progress: number }) {
  if (progress === 100)
    return <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />;
  if (progress > 0)
    return <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />;
  return <span className="inline-flex h-2 w-2 rounded-full bg-gray-300" />;
}

export function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    projectsApi
      .list()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data as { data: Project[] }).data || [];
        setProjects(data);
        setFiltered(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? projects.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              (p.stacks || []).some((s) => s.name.toLowerCase().includes(q))
          )
        : projects
    );
  }, [search, projects]);

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Manage all your active and past projects in one place."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/projects/create')}>
            New Project
          </Button>
        }
      />

      <Toolbar
        left={
          <div className="w-full max-w-[320px]">
            <Input
              placeholder="Search projects..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
        right={
          <span className="text-sm text-gray-500">
            {!isLoading && `${filtered.length} project${filtered.length !== 1 ? 's' : ''}`}
          </span>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-2xl bg-white">
          <EmptyState
            title={search ? 'No results found' : 'No projects yet'}
            description={search ? `No projects match "${search}"` : 'Create your first project to get started.'}
            action={!search ? <Button onClick={() => navigate('/projects/create')}>Create Project</Button> : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => {
            const progress = calculateProgress(project.phases || []);
            const members = (project.users || []).map((u) => u.name);
            const color = getProjectColor(project.id);
            const phasesCount = (project.phases || []).length;
            const completedPhases = (project.phases || []).filter(p => p.status === 'completed').length;

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`h-10 w-10 rounded-xl border ${color.bg} ${color.border} flex items-center justify-center flex-shrink-0`}>
                      <Folder className={`h-5 w-5 ${color.text}`} />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <StatusDot progress={progress} />
                        <span className="text-xs font-medium text-gray-500">
                          {progress === 100 ? 'Completed' : progress > 0 ? 'In progress' : 'Not started'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress === 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium">
                      {completedPhases}/{phasesCount} phases
                    </span>
                    {(project.stacks || []).length > 0 && (
                      <>
                        <span className="text-gray-200">·</span>
                        <div className="flex gap-1 flex-wrap">
                          {(project.stacks || []).slice(0, 2).map(s => (
                            <span key={s.id} className="text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5">
                              {s.name}
                            </span>
                          ))}
                          {(project.stacks || []).length > 2 && (
                            <span className="text-[10px] font-medium text-gray-400">+{(project.stacks || []).length - 2}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {members.length > 0 && <AvatarGroup names={members} max={3} size="sm" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
