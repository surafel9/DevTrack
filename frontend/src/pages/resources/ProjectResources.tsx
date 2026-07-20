import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Copy, Eye, EyeOff, Link as LinkIcon, Search, SearchX, Edit2, Trash2 } from 'lucide-react';
import { projectsApi, resourcesApi } from '../../api/endpoints';
import type { Project, ProjectResource } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, ConfirmDialog } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { EmptyState } from '../../components/common/EmptyState';

export function ProjectResources() {
  const { success, error } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteResourceId, setDeleteResourceId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newResource, setNewResource] = useState({ title: '', url: '', username: '', password: '' });
  const [editResource, setEditResource] = useState<ProjectResource | null>(null);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

  useEffect(() => {
    projectsApi.list()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        // Sort by id descending (assuming newer have higher ids) or by created_at if available
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setProjects(sorted);
        if (sorted.length > 0) {
          setSelectedProjectId(sorted[0].id);
        }
      })
      .catch(() => error('Failed to load projects'))
      .finally(() => setIsLoadingProjects(false));
  }, [error]);

  useEffect(() => {
    if (selectedProjectId) {
      loadResources(selectedProjectId);
    } else {
      setResources([]);
    }
  }, [selectedProjectId]);

  const loadResources = (projectId: number) => {
    setIsLoadingResources(true);
    resourcesApi.list(projectId)
      .then(res => setResources(res.data || []))
      .catch(() => error('Failed to load resources'))
      .finally(() => setIsLoadingResources(false));
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    return projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, searchQuery]);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    
    setIsSubmitting(true);
    try {
      await resourcesApi.create(selectedProjectId, newResource);
      success('Resource added successfully');
      setIsAddModalOpen(false);
      setNewResource({ title: '', url: '', username: '', password: '' });
      loadResources(selectedProjectId);
    } catch (err) {
      error('Failed to add resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !editResource) return;
    
    setIsSubmitting(true);
    try {
      const data = { 
        title: editResource.title, 
        url: editResource.url, 
        username: editResource.username, 
        password: editResource.password 
      };
      await resourcesApi.update(editResource.id, data);
      success('Resource updated successfully');
      setIsEditModalOpen(false);
      setEditResource(null);
      loadResources(selectedProjectId);
    } catch (err) {
      error('Failed to update resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteResourceId || !selectedProjectId) return;
    setIsSubmitting(true);
    try {
      await resourcesApi.delete(deleteResourceId);
      success('Resource deleted successfully');
      setDeleteResourceId(null);
      loadResources(selectedProjectId);
    } catch (err) {
      error('Failed to delete resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      success('Copied to clipboard');
    } catch (err) {
      error('Failed to copy to clipboard');
    }
  };

  const formatResourceText = (r: ProjectResource) => {
    let text = `${r.title}\n${r.url}`;
    if (r.username) text += `\n\nUsername:\n${r.username}`;
    if (r.password) text += `\n\nPassword:\n${r.password}`;
    return text;
  };

  const handleCopyResource = (r: ProjectResource) => copyToClipboard(formatResourceText(r));

  const handleCopyAll = () => {
    if (!selectedProjectId || resources.length === 0) return;
    const project = projects.find(p => p.id === selectedProjectId);
    
    let text = `${project?.name || 'Project'}\n\n\n`;
    resources.forEach((r, index) => {
      text += formatResourceText(r);
      if (index < resources.length - 1) text += `\n\n\n`;
    });
    
    copyToClipboard(text);
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openEditModal = (resource: ProjectResource) => {
    setEditResource(resource);
    setIsEditModalOpen(true);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Sidebar - Projects */}
      <div className="w-[300px] border-r border-gray-200 bg-gray-50/30 flex flex-col flex-shrink-0 z-10 hidden md:flex">
        <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Projects</h2>
          <Input
            placeholder="Search projects..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {isLoadingProjects ? (
            <p className="text-xs text-gray-400 p-4 text-center">Loading projects...</p>
          ) : filteredProjects.length === 0 ? (
            <div className="p-6 text-center">
              <SearchX className="h-6 w-6 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No projects found</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex items-center justify-between group ${
                  selectedProjectId === project.id
                    ? 'bg-gray-100/80 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="truncate pr-2">{project.name}</span>
                {selectedProjectId === project.id && (
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-900 flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Resources */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {!selectedProject ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState title="No project selected" description="Select a project from the sidebar to view its resources." />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{selectedProject.name}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {resources.length} resource{resources.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {resources.length > 0 && (
                    <Button variant="secondary" onClick={handleCopyAll} leftIcon={<Copy className="h-4 w-4" />}>
                      Copy All
                    </Button>
                  )}
                  <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                    Add Resource
                  </Button>
                </div>
              </div>
            </div>

            {/* Resources List */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {isLoadingResources ? (
                <div className="flex justify-center items-center h-48"><p className="text-sm text-gray-400">Loading resources...</p></div>
              ) : resources.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50/50 mt-4">
                  <EmptyState title="No resources yet" description="Add your first client-facing credential or link." action={<Button onClick={() => setIsAddModalOpen(true)}>Add Resource</Button>} />
                </div>
              ) : (
                <div className="max-w-4xl space-y-3">
                  {resources.map(resource => (
                    <div
                      key={resource.id}
                      className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        {/* Resource Info */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-start">
                          <div className="md:col-span-4 space-y-1.5">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{resource.title}</h3>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 truncate group/link">
                              <LinkIcon className="h-3.5 w-3.5 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                              {resource.url}
                            </a>
                          </div>

                          <div className="md:col-span-8 flex flex-col sm:flex-row gap-6">
                            <div className="flex-1 min-w-0">
                              {resource.username ? (
                                <>
                                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Username</p>
                                  <p className="text-sm text-gray-900 truncate font-medium">{resource.username}</p>
                                </>
                              ) : <div className="h-full" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {resource.password ? (
                                <>
                                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Password</p>
                                  <div className="flex items-center gap-2.5 group/pass">
                                    <p className="text-sm text-gray-900 font-mono tracking-tight truncate">
                                      {visiblePasswords[resource.id] ? resource.password : '••••••••'}
                                    </p>
                                    <button
                                      onClick={() => togglePasswordVisibility(resource.id)}
                                      className="text-gray-400 hover:text-gray-700 opacity-0 group-hover/pass:opacity-100 focus:opacity-100 transition-opacity outline-none"
                                      title={visiblePasswords[resource.id] ? "Hide password" : "Show password"}
                                    >
                                      {visiblePasswords[resource.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </>
                              ) : <div className="h-full" />}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-gray-100 mt-2 sm:mt-0">
                          <button
                            onClick={() => openEditModal(resource)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteResourceId(resource.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
                          <Button variant="secondary" size="sm" onClick={() => handleCopyResource(resource)} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Resource" description="Add a new client-facing link or credential.">
        <form onSubmit={handleAddResource} className="space-y-4 mt-2">
          <Input label="Resource Title" placeholder="e.g. CMS, Frontend Website" required value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} />
          <Input label="URL" type="url" placeholder="https://example.com" required value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} />
          <Input label="Username / Email (Optional)" placeholder="admin@example.com" value={newResource.username} onChange={(e) => setNewResource({ ...newResource, username: e.target.value })} />
          <Input label="Password (Optional)" type="password" placeholder="••••••••" value={newResource.password} onChange={(e) => setNewResource({ ...newResource, password: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Add Resource</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Resource" description="Update the details of this resource.">
        {editResource && (
          <form onSubmit={handleEditResource} className="space-y-4 mt-2">
            <Input label="Resource Title" placeholder="e.g. CMS" required value={editResource.title} onChange={(e) => setEditResource({ ...editResource, title: e.target.value })} />
            <Input label="URL" type="url" placeholder="https://example.com" required value={editResource.url} onChange={(e) => setEditResource({ ...editResource, url: e.target.value })} />
            <Input label="Username / Email (Optional)" placeholder="admin@example.com" value={editResource.username || ''} onChange={(e) => setEditResource({ ...editResource, username: e.target.value })} />
            <Input label="Password (Optional)" type="text" placeholder="••••••••" value={editResource.password || ''} onChange={(e) => setEditResource({ ...editResource, password: e.target.value })} />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteResourceId !== null}
        onClose={() => setDeleteResourceId(null)}
        onConfirm={handleDeleteResource}
        title="Delete Resource"
        description="Are you sure you want to delete this resource? This action cannot be undone."
        confirmLabel="Delete Resource"
        isLoading={isSubmitting}
      />
    </div>
  );
}
