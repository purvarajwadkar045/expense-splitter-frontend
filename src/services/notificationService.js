import API from './api';

const notificationService = {
  getNotifications: async () => {
    const response = await API.get('/notifications');
    return response.data; // expects array of Notification
  },

  markAllAsRead: async () => {
    const response = await API.post('/notifications/read-all');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await API.put(`/notifications/${id}/read`);
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;
