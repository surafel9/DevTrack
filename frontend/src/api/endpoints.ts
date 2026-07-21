import api from './axios';
import type {
  User,
  Project,
  Phase,
  Comment,
  Link,
  Stack,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  CreateProjectData,
  UpdateProjectData,
  CreatePhaseData,
  UpdatePhaseData,
  CreateCommentData,
  CreateLinkData,
  CreateStackData,
  ProjectResource,
  CreateResourceData,
} from '../types/models';

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginCredentials) =>
    api.post<AuthResponse>('/login', data),

  register: (data: RegisterCredentials) =>
    api.post<AuthResponse>('/register', data),

  logout: () => api.post('/logout'),

  profile: () => api.get<User>('/profile'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: () => api.get<Project[]>('/projects'),

  get: (id: number) => api.get<Project>(`/projects/${id}`),

  create: (data: CreateProjectData) =>
    api.post<Project>('/projects', data),

  update: (id: number, data: UpdateProjectData) =>
    api.put<Project>(`/projects/${id}`, data),

  delete: (id: number) => api.delete(`/projects/${id}`),
};

// ─── Phases ───────────────────────────────────────────────────────────────────

export const phasesApi = {
  list: (projectId: number) =>
    api.get<Phase[]>(`/projects/${projectId}/phases`),

  create: (projectId: number, data: CreatePhaseData) =>
    api.post<Phase>(`/projects/${projectId}/phases`, data),

  update: (projectId: number, phaseId: number, data: UpdatePhaseData) =>
    api.put<Phase>(`/projects/${projectId}/phases/${phaseId}`, data),

  delete: (projectId: number, phaseId: number) =>
    api.delete(`/projects/${projectId}/phases/${phaseId}`),
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const commentsApi = {
  list: (projectId: number) =>
    api.get<Comment[]>(`/projects/${projectId}/comments`),

  create: (projectId: number, data: CreateCommentData) =>
    api.post<Comment>(`/projects/${projectId}/comments`, data),

  delete: (commentId: number) => api.delete(`/comments/${commentId}`),
};

// ─── Links ────────────────────────────────────────────────────────────────────

export const linksApi = {
  list: (projectId: number) =>
    api.get<Link[]>(`/projects/${projectId}/links`),

  create: (projectId: number, data: CreateLinkData) =>
    api.post<Link>(`/projects/${projectId}/links`, data),

  delete: (linkId: number) => api.delete(`/links/${linkId}`),
};

// ─── Stacks ───────────────────────────────────────────────────────────────────

export const stacksApi = {
  list: () => api.get<Stack[]>('/stacks'),

  create: (data: CreateStackData) => api.post<Stack>('/stacks', data),

  listForProject: (projectId: number) =>
    api.get<Stack[]>(`/projects/${projectId}/stacks`),

  addToProject: (projectId: number, stackId: number) =>
    api.post(`/projects/${projectId}/stacks/${stackId}`),

  removeFromProject: (projectId: number, stackId: number) =>
    api.delete(`/projects/${projectId}/stacks/${stackId}`),
};

// ─── Team / Users ───────────────────────────────────────────────────────────────

export const usersApi = {
  list: () => api.get<User[]>('/users'),
  updatePermissions: (userId: number, permissions: string[]) =>
    api.put(`/users/${userId}/permissions`, { permissions }),
};

export const teamApi = {
  listForProject: (projectId: number) =>
    api.get<User[]>(`/projects/${projectId}/users`),
};

export const membersApi = {
  list: (projectId: number) =>
    api.get<User[]>(`/projects/${projectId}/members`),

  add: (projectId: number, userId: number) =>
    api.post(`/projects/${projectId}/members`, { user_id: userId }),

  remove: (projectId: number, userId: number) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
};

// ─── Resources ────────────────────────────────────────────────────────────────

export const resourcesApi = {
  list: (projectId: number) =>
    api.get<ProjectResource[]>(`/projects/${projectId}/resources`),

  create: (projectId: number, data: CreateResourceData) =>
    api.post<ProjectResource>(`/projects/${projectId}/resources`, data),

  get: (resourceId: number) => api.get<ProjectResource>(`/resources/${resourceId}`),

  update: (resourceId: number, data: Partial<CreateResourceData>) =>
    api.put<ProjectResource>(`/resources/${resourceId}`, data),

  delete: (resourceId: number) => api.delete(`/resources/${resourceId}`),
};
