import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdEmail, MdLock } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

import '../styles/auth.css';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const { login, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    await login(data);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage and split your group expenses</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@example.com"
            icon={MdEmail}
            register={register}
            errors={errors}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={MdLock}
            register={register}
            errors={errors}
            required
          />

          <Link 
            to="/forgot-password" 
            className="forgot-password-link"
          >
            Forgot Password?
          </Link>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;