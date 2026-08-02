import API from './api';

const authService = {
  login: async (credentials) => {
    // credentials expects { email, password }
    const response = await API.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    return response.data; // returns { access_token, token_type }
  },

  register: async (userData) => {
    // userData expects { name, email, password }
    // FastAPI UserCreate schema expects username, email, and password
    const response = await API.post('/auth/register', {
      username: userData.name,
      email: userData.email,
      password: userData.password
    });
    return response.data; // returns UserResponse
  },

  getCurrentUser: async () => {
    // Fetches authenticated user profile
    const response = await API.get('/users/me');
    return response.data; // returns UserResponse { id, username, email, created_at }
  },

  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, code, newPassword) => {
    const response = await API.post('/auth/reset-password', {
      email,
      code,
      new_password: newPassword
    });
    return response.data;
  },

  updateProfile: async (name) => {
    const response = await API.put('/users/me', { username: name });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await API.put('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }
};

export default authService;
