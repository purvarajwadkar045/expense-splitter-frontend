import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
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
          // Verify JWT validity by fetching profile details from backend
          const userProfile = await authService.getCurrentUser();
          const loggedUser = {
            name: userProfile.username,
            email: userProfile.email,
            id: userProfile.id,
            joinedDate: userProfile.created_at
          };
          setUser(loggedUser);
          localStorage.setItem('user', JSON.stringify(loggedUser));
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      // FastAPI returns { access_token, token_type }
      const receivedToken = data.access_token;
      
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);

      // Fetch user profile from the backend
      const userProfile = await authService.getCurrentUser();
      const loggedUser = { 
        name: userProfile.username, 
        email: userProfile.email,
        id: userProfile.id,
        joinedDate: userProfile.created_at
      };

      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      
      showToast.success('Successfully authenticated!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      const errorMsg = error.response?.data?.detail || 'Invalid email or password';
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      await authService.register(userData);
      showToast.success('Account created! Authenticating...');
      
      // Automatically log the user in using credentials
      const loginData = await authService.login({
        email: userData.email,
        password: userData.password
      });
      const receivedToken = loginData.access_token;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);

      const userProfile = await authService.getCurrentUser();
      const loggedUser = {
        name: userProfile.username,
        email: userProfile.email,
        id: userProfile.id,
        joinedDate: userProfile.created_at
      };
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      
      showToast.success('Welcome! Account created and logged in.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMsg = error.response?.data?.detail || 'Registration failed. Please try again.';
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      showToast.success('OTP security code sent! (Local Sandbox Mode)');
      navigate('/reset-password', { state: { email } });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    setLoading(true);
    try {
      showToast.success('Password updated successfully! (Local Sandbox Mode)');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name) => {
    setLoading(true);
    try {
      const localUser = JSON.parse(localStorage.getItem('user')) || {};
      localUser.name = name;
      localStorage.setItem('user', JSON.stringify(localUser));
      setUser(localUser);
      showToast.success('Profile details saved! (Local Sandbox Mode)');
    } catch (error) {
      showToast.error('Failed to save profile changes');
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