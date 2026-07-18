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
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const { login } = useAuth();
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
      await login(data);
      success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = getErrorMessage(err);
      setApiError(msg);
      error('Login failed', msg);
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
            <p className="mt-2 text-gray-500 font-medium">Welcome back</p>
            <p className="text-sm text-gray-500">Login to your account</p>
          </div>

          {apiError && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 font-medium">
              {apiError}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">
              <Input
                id="login-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-xs text-gray-500 hover:text-gray-900">Forgot password?</a>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                  Login
                </Button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-black font-medium hover:underline underline-offset-4">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
