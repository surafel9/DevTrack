import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Calendar,
  FileText,
  FolderOpen,
  ShieldAlert,
  Save,
} from 'lucide-react';
import { projectsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { PageContainer } from '../../components/layout/PageLayout';
import { useAuth } from '../../context/AuthContext';

const schema = z
  .object({
    name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
    description: z.string().min(10, 'Please provide a description (at least 10 characters)').max(1000),
    start_date: z.string().optional().or(z.literal('')),
    end_date: z.string().optional().or(z.literal('')),
  })
  .refine(
    data => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    { message: 'End date must be on or after start date', path: ['end_date'] },
  );

type FormData = z.infer<typeof schema>;

export function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin || (user?.permissions ?? []).includes('edit_project');

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectName, setProjectName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!id) return;
    projectsApi
      .get(Number(id))
      .then(res => {
        const raw = res.data as unknown;
        const p = (raw as { data?: typeof raw })?.data ?? raw;
        const project = p as {
          name: string;
          description: string;
          start_date?: string | null;
          end_date?: string | null;
        };
        setProjectName(project.name);
        reset({
          name: project.name,
          description: project.description,
          start_date: project.start_date ?? '',
          end_date: project.end_date ?? '',
        });
      })
      .catch(() => {
        error('Failed to load project');
        navigate('/projects');
      })
      .finally(() => setIsLoadingProject(false));
  }, [id, reset, error, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      await projectsApi.update(Number(id), {
        name: data.name,
        description: data.description,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      });
      success('Project updated successfully');
      navigate(`/projects/${id}`);
    } catch (err: unknown) {
      const axErr = err as { response?: { status?: number } };
      if (axErr.response?.status === 403) {
        error('Permission Denied', 'You do not have permission to edit this project.');
      } else {
        error('Failed to update project', getErrorMessage(err));
      }
    }
  };

  if (!canEdit) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
          <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100 shadow-sm">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Access Denied</h1>
          <p className="text-base text-gray-500 mb-8 leading-relaxed">
            You don't have permission to edit this project. An admin can grant you the{' '}
            <code className="text-sm font-mono bg-gray-100 px-1.5 py-0.5 rounded">edit_project</code>{' '}
            permission.
          </p>
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(`/projects/${id}`)}
          >
            Back to Project
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (isLoadingProject) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-gray-400 text-sm">Loading project…</div>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Back button */}
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 shadow-sm transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Project
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-7 md:px-10 border-b border-gray-100 flex items-start gap-4">
            <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-100/50">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Edit Project</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Editing: <span className="font-medium text-gray-700">{projectName}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10">
            {/* Two-column grid on larger screens */}
            <div className="grid grid-cols-1 gap-6">
              {/* Project Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  Project Name
                </label>
                <Input
                  id="edit-project-name"
                  placeholder="e.g. Acme Corp Web Application"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  Description
                </label>
                <Textarea
                  id="edit-project-description"
                  placeholder="What is the main goal or scope of this project?"
                  rows={4}
                  error={errors.description?.message}
                  {...register('description')}
                  className="resize-none"
                />
              </div>

              {/* Date fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    Start Date
                  </label>
                  <input
                    id="edit-project-start-date"
                    type="date"
                    {...register('start_date')}
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    End Date
                  </label>
                  <input
                    id="edit-project-end-date"
                    type="date"
                    {...register('end_date')}
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                  {errors.end_date && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.end_date.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 mt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/projects/${id}`)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isDirty}
                leftIcon={<Save className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Info note */}
        <p className="text-xs text-center text-gray-400 mt-4">
          Only authorized team members can modify project details.
        </p>
      </div>
    </div>
  );
}
