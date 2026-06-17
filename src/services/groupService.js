import API from './api';

const groupService = {
  getGroups: async () => {
    const response = await API.get('/groups');
    return response.data; // expects array of Group
  },

  getGroupById: async (id) => {
    const response = await API.get(`/groups/${id}`);
    return response.data; // expects Group details
  },

  createGroup: async (name, description, members = []) => {
    const response = await API.post('/groups', {
      name,
      description,
      members
    });
    return response.data; // expects Group response
  },

  updateGroup: async (id, groupData) => {
    const response = await API.put(`/groups/${id}`, groupData);
    return response.data; // expects Group response
  },

  deleteGroup: async (id) => {
    const response = await API.delete(`/groups/${id}`);
    return response.data;
  }
};

export default groupService;
