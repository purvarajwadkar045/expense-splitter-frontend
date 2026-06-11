import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdLock, MdVpnKey } from 'react-icons/md';
import { useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

import '../styles/auth.css';

const schema = yup.object().shape({
  code: yup
    .string()
    .length(6, 'Reset code must be exactly 6 characters')
    .required('Reset code is required'),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const { resetPassword, loading } = useAuth();
  const location = useLocation();
  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!email) {
      toast.error('Session expired. Please restart the password reset process.');
      return;
    }
    await resetPassword(email, data.code, data.newPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter the 6-digit code sent to your email to set a new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <Input
            label="Verification Code (OTP)"
            name="code"
            type="text"
            placeholder="Enter 6-digit code"
            icon={MdVpnKey}
            register={register}
            errors={errors}
            maxLength={6}
            required
          />

          <Input
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            icon={MdLock}
            register={register}
            errors={errors}
            required
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon={MdLock}
            register={register}
            errors={errors}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Reset Password
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Back to{' '}
            <Link to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;