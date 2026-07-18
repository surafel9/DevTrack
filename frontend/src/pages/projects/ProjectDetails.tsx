import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, Trash2, Calendar, Clock, Layers, Users,
  MessageSquare, Link as LinkIcon, Plus, Trash, CheckCircle2,
  Circle, PlayCircle, X, Folder
} from 'lucide-react';
import { projectsApi, phasesApi, commentsApi, linksApi, stacksApi } from '../../api/endpoints';
import type { Project, Phase, Stack } from '../../types/models';
import { calculateProgress, formatDate, getErrorMessage, formatRelativeTime, cn } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, PhaseStatusBadge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Avatar } from '../../components/ui/Avatar';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { Input, Textarea } from '../../components/ui/Input';
import { PageContainer, SectionLabel } from '../../components/layout/PageLayout';
import { EmptyState } from '../../components/common/EmptyState';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadProject = () => {
    if (!id) return;
    projectsApi.get(Number(id))
      .then((res) => {
        const data = (res.data as any)?.data || res.data;
        setProject(data);
      })
      .catch((err) => {
        error('Failed to load project', getErrorMessage(err));
        navigate('/projects');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadProject(); }, [id]);

  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(project.id);
      success('Project deleted');
      navigate('/projects');
    } catch (err) {
      error('Failed to delete project', getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading || !project) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-gray-400 text-sm">Loading project…</div>
      </PageContainer>
    );
  }

  const progress = calculateProgress(project.phases || []);

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/projects')} className="-ml-2">
          Back to Projects
        </Button>
      </div>

      {/* Hero Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Folder className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{project.name}</h1>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Created {formatDate(project.created_at)}
              </span>
              {project.updated_at && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {formatRelativeTime(project.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${project.id}/edit`)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              progress === 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
          <span>{(project.phases || []).length} phases</span>
          <span>·</span>
          <span>{(project.users || []).length} members</span>
          <span>·</span>
          <span>{(project.stacks || []).length} technologies</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-gray-100 px-6 pt-4 bg-gray-50/30">
            <TabsList className="gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="phases">Phases</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="stack">Stack</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8">
            <TabsContent value="overview" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-2">
                  <SectionLabel>Description</SectionLabel>
                  <div className="mt-3 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {project.description || <span className="text-gray-400 italic">No description provided.</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <SectionLabel>Summary</SectionLabel>
                  <div className="mt-3 space-y-0 divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {[
                      { label: 'Phases', value: (project.phases || []).length },
                      { label: 'Team Members', value: (project.users || []).length },
                      { label: 'Links', value: (project.links || []).length },
                      { label: 'Technologies', value: (project.stacks || []).length },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center px-4 py-3 bg-white">
                        <span className="text-sm text-gray-500">{label}</span>
                        <span className="text-sm font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="phases" className="mt-0 outline-none">
              <PhasesTab project={project} onUpdate={loadProject} />
            </TabsContent>

            <TabsContent value="team" className="mt-0 outline-none">
              <TeamTab project={project} />
            </TabsContent>

            <TabsContent value="comments" className="mt-0 outline-none">
              <CommentsTab project={project} onUpdate={loadProject} />
            </TabsContent>

            <TabsContent value="links" className="mt-0 outline-none">
              <LinksTab project={project} onUpdate={loadProject} />
            </TabsContent>

            <TabsContent value="stack" className="mt-0 outline-none">
              <StackTab project={project} onUpdate={loadProject} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}

// ─── PhasesTab ────────────────────────────────────────────────────────────────
function PhasesTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const { success, error } = useToast();
  const phases = project.phases || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsAdding(true);
    try {
      await phasesApi.create(project.id, { name: newName, status: 'pending', order: phases.length });
      setNewName('');
      success('Phase added');
      onUpdate();
    } catch (err) {
      error('Failed to add phase', getErrorMessage(err));
    } finally { setIsAdding(false); }
  };

  const handleStatusChange = async (phase: Phase, status: 'completed' | 'active' | 'pending') => {
    try {
      await phasesApi.update(project.id, phase.id, { status });
      onUpdate();
    } catch (err) { error('Failed to update phase', getErrorMessage(err)); }
  };

  const handleDelete = async (phaseId: number) => {
    try {
      await phasesApi.delete(project.id, phaseId);
      success('Phase removed');
      onUpdate();
    } catch (err) { error('Failed to remove phase', getErrorMessage(err)); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionLabel>Project Timeline</SectionLabel>
      <div className="space-y-3 mt-4">
        {phases.map((phase) => (
          <div key={phase.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {phase.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
              {phase.status === 'active' && <PlayCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />}
              {phase.status === 'pending' && <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />}
              <div className="min-w-0">
                <h4 className="font-medium text-gray-900 truncate text-sm">{phase.name}</h4>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{phase.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
                {(['pending', 'active', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(phase, status)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize',
                      phase.status === status
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleDelete(phase.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {phases.length === 0 && <EmptyState title="No phases yet" description="Add project phases to track progress." />}
      </div>
      <div className="pt-6 border-t border-gray-100">
        <form onSubmit={handleAdd} className="flex items-end gap-3 max-w-md">
          <div className="flex-1">
            <Input placeholder="Phase name (e.g. Design, Backend…)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <Button type="submit" isLoading={isAdding} disabled={!newName.trim()}>Add Phase</Button>
        </form>
      </div>
    </div>
  );
}

// ─── TeamTab ──────────────────────────────────────────────────────────────────
function TeamTab({ project }: { project: Project }) {
  const users = project.users || [];
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <SectionLabel>Team Members</SectionLabel>
        <Button size="sm" variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" />}>Add Member</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={user.name} size="md" />
              <div className="min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">{user.name}</h4>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        ))}
        {users.length === 0 && (
          <div className="col-span-full border border-dashed border-gray-200 rounded-xl">
            <EmptyState title="No members" description="Assign people to collaborate on this project." />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CommentsTab ──────────────────────────────────────────────────────────────
function CommentsTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const { user: currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();
  const comments = project.comments || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await commentsApi.create(project.id, { content });
      setContent('');
      success('Comment posted');
      onUpdate();
    } catch (err) {
      error('Failed to post comment', getErrorMessage(err));
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentsApi.delete(commentId);
      onUpdate();
    } catch (err) { error('Failed to delete comment', getErrorMessage(err)); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <SectionLabel>Discussions</SectionLabel>
      <div className="space-y-4 mt-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="flex-shrink-0 mt-0.5">
              <Avatar name={comment.user?.name || 'Unknown'} size="md" />
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{comment.user?.name}</span>
                  <span className="text-xs text-gray-400">{formatRelativeTime(comment.created_at)}</span>
                </div>
                {currentUser?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <EmptyState title="No comments" description="Start the discussion with your team." />}
      </div>
      <div className="pt-6 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-shrink-0 mt-0.5"><Avatar name={currentUser?.name || ''} size="md" /></div>
          <div className="flex-1 space-y-3">
            <Textarea placeholder="Leave a comment…" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting} disabled={!content.trim()}>Post Comment</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── LinksTab ─────────────────────────────────────────────────────────────────
function LinksTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { success, error } = useToast();
  const links = project.links || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setIsAdding(true);
    try {
      await linksApi.create(project.id, { title, url });
      setTitle(''); setUrl('');
      success('Link added');
      onUpdate();
    } catch (err) {
      error('Failed to add link', getErrorMessage(err));
    } finally { setIsAdding(false); }
  };

  const handleDelete = async (linkId: number) => {
    try {
      await linksApi.delete(linkId);
      success('Link removed');
      onUpdate();
    } catch (err) { error('Failed to remove link', getErrorMessage(err)); }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <SectionLabel>External Links</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {links.map((link) => (
            <div key={link.id} className="group relative p-4 flex flex-col justify-center border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white">
              <button
                onClick={() => handleDelete(link.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash className="h-4 w-4" />
              </button>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-left pr-8">
                <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-gray-700 transition-colors">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate group-hover:underline">{link.title}</h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{link.url}</p>
                </div>
              </a>
            </div>
          ))}
        </div>
        {links.length === 0 && (
          <div className="mt-4 border border-dashed border-gray-200 rounded-xl">
            <EmptyState title="No external links" description="Add links to GitHub, Figma, Docs, etc." />
          </div>
        )}
      </div>
      <div className="pt-6 border-t border-gray-100 max-w-2xl">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Add New Link</h4>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full"><Input label="Title" placeholder="e.g. GitHub Repository" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="flex-1 w-full"><Input label="URL" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} type="url" /></div>
          <Button type="submit" isLoading={isAdding} disabled={!title.trim() || !url.trim()} className="w-full sm:w-auto">Add Link</Button>
        </form>
      </div>
    </div>
  );
}

// ─── StackTab ─────────────────────────────────────────────────────────────────
function StackTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [availableStacks, setAvailableStacks] = useState<Stack[]>([]);
  const [newStackName, setNewStackName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { success, error } = useToast();
  const projectStacks = project.stacks || [];

  useEffect(() => {
    stacksApi.list().then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
      setAvailableStacks(data);
    }).catch(console.error);
  }, []);

  const handleAddExisting = async (stackId: number) => {
    try { await stacksApi.addToProject(project.id, stackId); success('Technology added'); onUpdate(); }
    catch (err) { error('Failed to add technology', getErrorMessage(err)); }
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStackName.trim()) return;
    setIsAddingNew(true);
    try {
      const res = await stacksApi.create({ name: newStackName });
      const createdStack = (res.data as any).data || res.data;
      await stacksApi.addToProject(project.id, createdStack.id);
      setNewStackName('');
      success('Technology added');
      onUpdate();
      stacksApi.list().then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data as any).data || [];
        setAvailableStacks(data);
      });
    } catch (err) { error('Failed to add technology', getErrorMessage(err)); }
    finally { setIsAddingNew(false); }
  };

  const handleRemove = async (stackId: number) => {
    try { await stacksApi.removeFromProject(project.id, stackId); success('Technology removed'); onUpdate(); }
    catch (err) { error('Failed to remove technology', getErrorMessage(err)); }
  };

  const unassignedStacks = availableStacks.filter(s => !projectStacks.some(ps => ps.id === s.id));

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <SectionLabel>Project Stack</SectionLabel>
        <div className="flex flex-wrap gap-2 mt-4">
          {projectStacks.map((stack) => (
            <div key={stack.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-700">
              <span>{stack.name}</span>
              <button onClick={() => handleRemove(stack.id)} className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {projectStacks.length === 0 && (
            <div className="w-full border border-dashed border-gray-200 rounded-xl">
              <EmptyState title="No technologies" description="Specify the stack being used for this project." />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-gray-100">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Add Existing</h4>
          <div className="flex flex-wrap gap-2">
            {unassignedStacks.map(stack => (
              <button key={stack.id} onClick={() => handleAddExisting(stack.id)}
                className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-white transition-colors flex items-center gap-1.5">
                <Plus className="h-3 w-3" />{stack.name}
              </button>
            ))}
            {unassignedStacks.length === 0 && <p className="text-sm text-gray-400">All technologies have been added.</p>}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Create New</h4>
          <form onSubmit={handleAddNew} className="flex gap-2 max-w-sm">
            <Input placeholder="e.g. Next.js" value={newStackName} onChange={(e) => setNewStackName(e.target.value)} />
            <Button type="submit" isLoading={isAddingNew} disabled={!newStackName.trim()} variant="secondary">Add</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
