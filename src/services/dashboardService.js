import API from './api';

const dashboardService = {
  getDashboardData: async () => {
    const response = await API.get('/dashboard');
    return response.data; // returns DashboardResponse schema
  }
};

export default dashboardService;
