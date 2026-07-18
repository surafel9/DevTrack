import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const { register: registerUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await registerUser(data);
      success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      const msg = getErrorMessage(err);
      setApiError(msg);
      error('Registration failed', msg);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-10 w-10 rounded-md bg-black flex items-center justify-center mb-4">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">DevTrack</h1>
            <p className="mt-2 text-gray-500 font-medium">Create account</p>
            <p className="text-sm text-gray-500">Join DevTrack today</p>
          </div>

          {apiError && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 font-medium">
              {apiError}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
              <Input
                id="register-name"
                label="Name"
                type="text"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                id="register-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                id="register-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                id="register-password-confirm"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.password_confirmation?.message}
                {...register('password_confirmation')}
              />

              <div className="pt-2">
                <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                  Create account
                </Button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-medium hover:underline underline-offset-4">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
