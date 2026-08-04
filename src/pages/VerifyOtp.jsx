import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MdEmail, MdLock, MdRefresh } from 'react-icons/md';
import authService from '../services/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import showToast from '../components/ui/Toast';

import '../styles/auth.css';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Handle timer countdown for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast.error('Email address is required');
      return;
    }
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      showToast.error('Please enter the OTP verification code');
      return;
    }
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      showToast.error('OTP code must be exactly 6 digits');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(email, cleanOtp);
      showToast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error('OTP verification failed:', err);
      const errorMsg = err.response?.data?.detail || 'Invalid or expired OTP code';
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast.error('Email address is required to resend verification code');
      return;
    }
    if (cooldown > 0) return;

    setResending(true);
    try {
      await authService.resendOtp(email);
      showToast.success('A new OTP verification code has been sent!');
      setCooldown(60);
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to resend code';
      showToast.error(errorMsg);
    } finally {
      setResending(false);
    }
  };

  const isOtpValid = otp.trim().length === 6 && /^\d+$/.test(otp.trim());

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Verify Account</h1>
          <p className="auth-subtitle">Enter the 6-digit code sent to your email address</p>
          {location.state?.existing && (
            <div className="existing-account-note" style={{ marginTop: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              An account already exists for this email. If you have not completed verification, enter the code here or use "Resend OTP Code" to request a new code.
            </div>
          )}
        </div>

        <form onSubmit={handleVerify} className="auth-form">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            icon={MdEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!!location.state?.email}
          />

          <Input
            label="Verification Code (6-digit OTP)"
            type="text"
            placeholder="e.g. 123456"
            icon={MdLock}
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            required
            maxLength={6}
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || !isOtpValid || !email}
          >
            Verify Email
          </Button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="btn btn-secondary"
            style={{
              background: 'transparent',
              border: 'none',
              color: cooldown > 0 ? 'var(--text-dim)' : 'var(--primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MdRefresh size={16} />
            {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend OTP Code'}
          </button>

          <div className="auth-footer" style={{ marginTop: '10px' }}>
            Back to <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
