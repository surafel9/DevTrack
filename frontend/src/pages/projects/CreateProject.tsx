import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, FolderPlus, ShieldAlert } from 'lucide-react';
import { projectsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { PageContainer } from '../../components/layout/PageLayout';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Please provide a description (at least 10 characters)').max(1000),
});

type FormData = z.infer<typeof schema>;

export function CreateProject() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();

  const isAuthorized = user?.role === 'admin' || (user?.permissions || []).includes('create_project');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await projectsApi.create(data);
      const projectId = (res.data as any).id || (res.data as any).data?.id;
      success('Project created successfully');
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      if (err.response?.status === 403) {
        error('Permission Denied', 'You do not have permission to create projects.');
      } else {
        error('Failed to create project', getErrorMessage(err));
      }
    }
  };

  if (!isAuthorized) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
          <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100 shadow-sm">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Access Denied</h1>
          <p className="text-base text-gray-500 mb-8 leading-relaxed">
            You don't have permission to create a new project. Please contact your company administrator to request access.
          </p>
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/projects')}
            className="w-full sm:w-auto"
          >
            Return to Projects
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-[640px]">
        <button
          onClick={() => navigate('/projects')}
          className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 shadow-sm transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Projects
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-8 md:px-10 md:py-10 border-b border-gray-100 flex flex-col gap-3">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-2 border border-indigo-100/50">
              <FolderPlus className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Project</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Set up the foundational details for your new project. You'll be able to invite team members and plan phases after creation.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 flex flex-col gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Name
                </label>
                <Input
                  id="project-name"
                  placeholder="e.g. Acme Corp Web Application"
                  error={errors.name?.message}
                  {...register('name')}
                  className="bg-gray-50/50 focus:bg-white transition-colors py-3"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Use a clear, identifiable name for your team.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <Textarea
                  id="project-description"
                  placeholder="What is the main goal or scope of this project?"
                  rows={4}
                  error={errors.description?.message}
                  {...register('description')}
                  className="bg-gray-50/50 focus:bg-white transition-colors py-3 resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Provide a brief overview to help team members understand the context.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/projects')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white"
              >
                Create Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
