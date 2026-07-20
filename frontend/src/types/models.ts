export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Stack {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export type PhaseStatus = 'completed' | 'active' | 'pending';

export interface Phase {
  id: number;
  project_id: number;
  name: string;
  status: PhaseStatus;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: number;
  project_id: number;
  user_id: number;
  content: string;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface Link {
  id: number;
  project_id: number;
  title: string;
  url: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  phases?: Phase[];
  comments?: Comment[];
  links?: Link[];
  users?: User[];
  stacks?: Stack[];
  created_at?: string;
  updated_at?: string;
}

export interface ProjectResource {
  id: number;
  project_id: number;
  title: string;
  url: string;
  username?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export interface UpdateProjectData {
  name: string;
  description: string;
}

export interface CreatePhaseData {
  name: string;
  status: PhaseStatus;
  order: number;
}

export interface UpdatePhaseData {
  name?: string;
  status?: PhaseStatus;
  order?: number;
}

export interface CreateCommentData {
  content: string;
}

export interface CreateLinkData {
  title: string;
  url: string;
}

export interface CreateStackData {
  name: string;
}

export interface CreateResourceData {
  title: string;
  url: string;
  username?: string;
  password?: string;
}
