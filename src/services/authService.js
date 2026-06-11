import API from './api';

const authService = {
  login: async (credentials) => {
    // credentials are { email, password }
    // API endpoint expect JSON schemas of UserLogin
    const response = await API.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    return response.data; // expects { access_token, token_type }
  },

  register: async (userData) => {
    // userData are { name, email, password }
    const response = await API.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password
    });
    return response.data; // expects UserResponse
  },

  sendOTP: async (email) => {
    const response = await API.post('/auth/send-otp', { email });
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await API.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await API.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Mock Fallbacks for Profile & password edits (since not present in FastAPI routers yet)
  updateProfile: async (name) => {
    const localUser = JSON.parse(localStorage.getItem('user')) || {};
    localUser.name = name;
    localStorage.setItem('user', JSON.stringify(localUser));
    return { success: true, user: localUser };
  },

  changePassword: async (currentPassword, newPassword) => {
    // simulate password change
    return { success: true, message: 'Password updated successfully!' };
  }
};

export default authService;
