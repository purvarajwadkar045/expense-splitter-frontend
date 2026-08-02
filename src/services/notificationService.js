import API from './api';

const mapBackendNotificationToFrontend = (n) => {
  let type = 'group';
  const titleLower = (n.title || '').toLowerCase();
  if (titleLower.includes('expense') || titleLower.includes('bill')) {
    type = 'expense';
  } else if (titleLower.includes('settle') || titleLower.includes('payment') || titleLower.includes('repayment')) {
    type = 'settlement';
  }

  const createdDate = new Date(n.created_at);
  const diffMs = new Date() - createdDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeStr = 'Just now';
  if (diffDays > 0) {
    timeStr = `${diffDays}d ago`;
  } else if (diffHours > 0) {
    timeStr = `${diffHours}h ago`;
  } else if (diffMins > 0) {
    timeStr = `${diffMins}m ago`;
  }

  return {
    id: n.id,
    type,
    title: n.title,
    message: n.message,
    time: timeStr,
    unread: !n.is_read
  };
};

const notificationService = {
  getNotifications: async () => {
    const response = await API.get('/notifications');
    return (response.data || []).map(mapBackendNotificationToFrontend);
  },

  markAllAsRead: async () => {
    const response = await API.patch('/notifications/read-all');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await API.patch(`/notifications/${id}/read`);
    return mapBackendNotificationToFrontend(response.data);
  },

  deleteNotification: async (id) => {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;
