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

  updateProfile: async (name) => {
    const response = await API.put('/users/me', { name });
    return response.data; // expects updated UserResponse
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await API.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data; // expects MessageResponse
  }
};

export default authService;
