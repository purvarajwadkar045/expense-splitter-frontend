import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import showToast from '../components/ui/Toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // If token is found, fetch user profile from backend
          const fetchedUser = await userService.getCurrentUser();
          setUser(fetchedUser);
          localStorage.setItem('user', JSON.stringify(fetchedUser));
        } catch (error) {
          console.error('Failed to restore session from server, using local cache:', error);
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Subscribe to automatic 401 logouts from API response interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      showToast.error('Session expired. Please log in again.');
      navigate('/login');
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [navigate]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      const receivedToken = data.access_token;
      
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);

      let loggedUser;
      try {
        loggedUser = await userService.getCurrentUser();
      } catch (err) {
        console.warn('Could not fetch user profile, creating fallback details.');
        loggedUser = { 
          name: credentials.email.split('@')[0], 
          email: credentials.email,
          joinedDate: new Date().toISOString().split('T')[0]
        };
      }

      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      
      showToast.success('Successfully authenticated!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to authenticate';
      showToast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      await authService.register(userData);
      showToast.success('Account created successfully!');
      // Auto login after registration
      await login({ email: userData.email, password: userData.password });
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to register account';
      showToast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      await authService.sendOTP(email);
      showToast.success('OTP security code sent to your email!');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to send OTP';
      showToast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    setLoading(true);
    try {
      await authService.changePassword(code, newPassword);
      showToast.success('Password updated successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to reset password';
      showToast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name) => {
    setLoading(true);
    try {
      const res = await authService.updateProfile(name);
      // Backend should return user profile: { id, name, email } or similar
      const updatedUser = res.user || res;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showToast.success('Profile details saved!');
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to save profile changes';
      showToast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    showToast.success('Successfully signed out');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        forgotPassword,
        resetPassword,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};