import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdAccountCircle, MdEmail, MdEdit, MdLock, MdSave, MdCancel } from 'react-icons/md';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import authService from '../services/authService';

import '../styles/dashboard.css';
import '../styles/components.css';
import '../styles/profile.css';

const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm new password is required'),
});

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const toast = useToast();

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data.name);
      setIsEditingProfile(false);
    } catch (err) {
      toast.error('Failed to update profile details.');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to change password. Please check your credentials.');
    }
  };

  // Convert ISO date to readable string
  const getJoinedDate = () => {
    if (!user?.joinedDate) return 'Recent';
    const d = new Date(user.joinedDate);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="page-container profile-page-wrapper">
      <header className="dashboard-header">
        <h1 className="header-title">My Profile</h1>
        <p className="header-subtitle">Update your personal account information and security credentials.</p>
      </header>

      <div className="profile-page-grid">
        {/* Account Info Details Card */}
        <div className="glass-card profile-card details-card-padding">
          <div className="profile-meta-row">
            <div className="profile-large-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-info-block">
              <h3>{user?.name || 'Guest User'}</h3>
              <div className="profile-info-details">
                <p>
                  <MdEmail size={14} />
                  {user?.email || 'guest@example.com'}
                </p>
                <span className="profile-date-badge">
                  Joined: {getJoinedDate()}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="auth-form">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your name"
              icon={MdAccountCircle}
              register={profileRegister}
              errors={profileErrors}
              disabled={!isEditingProfile}
              required
            />

            {isEditingProfile ? (
              <div className="form-actions">
                <Button 
                  onClick={() => setIsEditingProfile(false)} 
                  variant="secondary"
                  icon={MdCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={loading}
                  icon={MdSave}
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="form-actions">
                <Button 
                  onClick={() => setIsEditingProfile(true)} 
                  variant="primary"
                  icon={MdEdit}
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Password Management Card */}
        <div className="glass-card details-card-padding">
          <h3 className="section-title">Change Account Password</h3>
          
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="auth-form">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              icon={MdLock}
              register={passwordRegister}
              errors={passwordErrors}
              required
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              icon={MdLock}
              register={passwordRegister}
              errors={passwordErrors}
              required
            />

            <Input
              label="Confirm New Password"
              name="confirmNewPassword"
              type="password"
              placeholder="••••••••"
              icon={MdLock}
              register={passwordRegister}
              errors={passwordErrors}
              required
            />

            <div className="form-actions">
              <Button 
                type="submit" 
                variant="primary"
                icon={MdLock}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;