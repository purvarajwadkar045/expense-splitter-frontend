import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdEmail } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

import '../styles/auth.css';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const { forgotPassword, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    await forgotPassword(data.email);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to receive a password reset security code</p>
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

          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Send Code
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Remembered your password?{' '}
            <Link to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;