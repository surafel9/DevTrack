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

// ─── Team ─────────────────────────────────────────────────────────────────────

export const teamApi = {
  listForProject: (projectId: number) =>
    api.get<User[]>(`/projects/${projectId}/users`),
};
