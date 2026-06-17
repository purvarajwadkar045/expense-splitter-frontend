import API from './api';

const userService = {
  getCurrentUser: async () => {
    const response = await API.get('/users/me');
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await API.get('/users', {
      params: { q: query }
    });
    return response.data; // expects array of UserResponse
  }
};

export default userService;
