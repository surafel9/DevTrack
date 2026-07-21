import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Projects } from '../pages/projects/Projects';
import { CreateProject } from '../pages/projects/CreateProject';
import { ProjectDetails } from '../pages/projects/ProjectDetails';
import { ProjectResources } from '../pages/resources/ProjectResources';
import { Team } from '../pages/team/Team';
import { Settings } from '../pages/settings/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-screen bg-[#0a0a0f] flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-screen bg-[#0a0a0f] flex items-center justify-center">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/create" element={<CreateProject />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/project-resources" element={<ProjectResources />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
