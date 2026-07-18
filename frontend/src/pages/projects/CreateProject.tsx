import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { projectsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { PageContainer, PageHeader, FormCard, Section } from '../../components/layout/PageLayout';

const schema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Please provide a description (at least 10 characters)').max(1000),
});

type FormData = z.infer<typeof schema>;

export function CreateProject() {
  const navigate = useNavigate();
  const { success, error } = useToast();

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
    } catch (err) {
      error('Failed to create project', getErrorMessage(err));
    }
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/projects')}
          className="-ml-3"
        >
          Back to Projects
        </Button>
      </div>

      <PageHeader
        title="Create New Project"
        description="Set up the details for your new project. You can add phases, team, and stack later."
      />

      <FormCard maxWidth="720px">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Section>
            <Input
              id="project-name"
              label="Project Name"
              placeholder="e.g. Hospital Management System"
              error={errors.name?.message}
              {...register('name')}
            />

            <Textarea
              id="project-description"
              label="Description"
              placeholder="Describe the goals and scope of this project..."
              rows={5}
              error={errors.description?.message}
              {...register('description')}
            />
          </Section>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/projects')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Project
            </Button>
          </div>
        </form>
      </FormCard>
    </PageContainer>
  );
}
