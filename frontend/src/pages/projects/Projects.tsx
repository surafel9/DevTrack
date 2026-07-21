import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isAdmin = user?.role === 'admin';
  const canCreate = isAdmin || (user?.permissions || []).includes('create_project');

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
          canCreate ? (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/projects/create')}>
              New Project
            </Button>
          ) : undefined
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-2xl bg-white">
          <EmptyState
            title={search ? 'No results found' : isAdmin ? 'No projects yet' : 'You are not assigned to any projects yet.'}
            description={search ? `No projects match "${search}"` : canCreate ? 'Create your first project to get started.' : 'When you are added to a project, it will appear here.'}
            action={!search && canCreate ? <Button onClick={() => navigate('/projects/create')}>Create Project</Button> : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((project) => {
            const progress = calculateProgress(project.phases || []);
            const members = (project.users || []).map((u) => u.name);
            const color = getProjectColor(project.id);
            const phasesCount = (project.phases || []).length;
            const completedPhases = (project.phases || []).filter(p => p.status === 'completed').length;
            const sortedPhases = [...(project.phases || [])].sort((a, b) => a.order - b.order);
            const currentPhase = sortedPhases.find(p => p.status === 'active') || sortedPhases.find(p => p.status === 'pending');
            
            let phaseText = 'No phases';
            if (currentPhase) {
              phaseText = currentPhase.status === 'active' ? `${currentPhase.name} (Under Development)` : currentPhase.name;
            } else if (phasesCount > 0 && completedPhases === phasesCount) {
              phaseText = 'All phases completed';
            }
            
            const phaseStatus = currentPhase ? `Phase ${sortedPhases.indexOf(currentPhase) + 1} of ${phasesCount}` : (phasesCount > 0 ? 'Completed' : 'Setup');

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
              >
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-[15px] leading-snug mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className={`h-8 w-8 rounded-lg border ${color.bg} ${color.border} flex items-center justify-center flex-shrink-0`}>
                      <Folder className={`h-4 w-4 ${color.text}`} />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex flex-col gap-1.5 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{phaseStatus}</span>
                      <span className="text-[11px] font-semibold text-gray-700">{Math.round(progress)}%</span>
                    </div>
                    <div className="text-xs font-medium text-gray-700 line-clamp-1">
                      {phaseText}
                    </div>
                    <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress === 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between gap-2 bg-white">
                  <div className="flex gap-1 flex-wrap">
                    {(project.stacks || []).slice(0, 2).map(s => (
                      <span key={s.id} className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                        {s.name}
                      </span>
                    ))}
                    {(project.stacks || []).length > 2 && (
                      <span className="text-[10px] font-medium text-gray-400">+{(project.stacks || []).length - 2}</span>
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
