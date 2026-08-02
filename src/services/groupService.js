import API from './api';

const getEmailForName = (name) => {
  const lower = name.toLowerCase().trim();
  if (lower.includes('@')) return name;
  const mapping = {
    'sakshi': 'sakshi12@gmail.com',
    'rahul': 'rahul@gmail.com',
    'priya': 'priya@gmail.com',
    'aman': 'aman@gmail.com',
    'neha': 'neha@gmail.com',
    'vikram': 'vikram@gmail.com',
    'shreya': 'shreya@gmail.com',
    'amit': 'amit@gmail.com'
  };
  return mapping[lower] || `${lower}@gmail.com`;
};

const groupService = {
  getGroups: async () => {
    const response = await API.get('/groups');
    return response.data;
  },

  getGroupById: async (id) => {
    const response = await API.get(`/groups/${id}`);
    return response.data;
  },

  createGroup: async (name, description, members = []) => {
    const response = await API.post('/groups', {
      name,
      description
    });
    
    const createdGroup = response.data;
    const groupId = createdGroup.id;

    const addedMembers = [];
    for (const member of members) {
      if (member === 'You') continue;
      const email = getEmailForName(member);
      try {
        await API.post(`/groups/${groupId}/members`, { email });
        addedMembers.push(member);
      } catch (err) {
        console.warn(`Failed to add member ${member} (${email}) to backend:`, err);
        addedMembers.push(member);
      }
    }

    return {
      id: String(groupId),
      name: createdGroup.name,
      description: createdGroup.description || '',
      members: ['You', ...addedMembers],
      createdDate: new Date(createdGroup.created_at).toISOString().split('T')[0],
      totalExpenses: 0
    };
  },

  updateGroup: async (id, groupData) => {
    const response = await API.put(`/groups/${id}`, {
      name: groupData.name,
      description: groupData.description
    });
    
    const updatedGroup = response.data;
    const newMembers = groupData.members || [];
    const addedMembers = [];
    
    for (const member of newMembers) {
      if (member === 'You') continue;
      const email = getEmailForName(member);
      try {
        await API.post(`/groups/${id}/members`, { email });
      } catch (err) {
        console.warn(`Failed to add member ${member} to backend:`, err);
      }
      addedMembers.push(member);
    }

    return {
      id: String(updatedGroup.id),
      name: updatedGroup.name,
      description: updatedGroup.description || '',
      members: ['You', ...addedMembers],
      createdDate: new Date(updatedGroup.created_at).toISOString().split('T')[0],
      totalExpenses: 0
    };
  },

  deleteGroup: async (id) => {
    const response = await API.delete(`/groups/${id}`);
    return response.data;
  },

  addMember: async (groupId, email) => {
    const response = await API.post(`/groups/${groupId}/members`, { email });
    return response.data;
  }
};

export default groupService;
