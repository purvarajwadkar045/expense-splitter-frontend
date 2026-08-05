import API from './api';

const getEmailForName = (name) => {
  // Accept explicit emails only. Do not fabricate or fallback to fake emails.
  if (!name) return null;
  const trimmed = String(name).trim();
  if (trimmed.includes('@')) return trimmed;
  // Non-email inputs are considered display names and must be resolved by the caller.
  return null;
};

const safeFormatDate = (val) => {
  try {
    if (!val) return null;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
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
      const failedMembers = [];
      for (const member of members) {
        if (member === 'You') continue;
        const email = getEmailForName(member);
        if (!email) {
          // member input was not an email — record as failed and continue
          failedMembers.push({ member, reason: 'Invalid email format' });
          continue;
        }
        try {
          await API.post(`/groups/${groupId}/members`, { email });
          addedMembers.push(member);
        } catch (err) {
          // Record the failure so the caller can inform the user; do NOT optimistic-add.
          failedMembers.push({ member, reason: err.response?.data?.detail || 'Failed to add member' });
        }
      }

      const result = {
        id: String(groupId),
        name: createdGroup.name,
        description: createdGroup.description || '',
        members: ['You', ...addedMembers],
        createdDate: safeFormatDate(createdGroup.created_at),
        totalExpenses: 0,
        failedMembers // array of { member, reason }
      };

      return result;
  },

  updateGroup: async (id, groupData) => {
    const response = await API.put(`/groups/${id}`, {
      name: groupData.name,
      description: groupData.description
    });
    
    const updatedGroup = response.data;
    const newMembers = groupData.members || [];
    const addedMembers = [];
    const failedMembers = [];
    
    for (const member of newMembers) {
      if (member === 'You') continue;
      const email = getEmailForName(member);
      if (!email) {
        failedMembers.push({ member, reason: 'Invalid email format' });
        continue;
      }
      try {
        await API.post(`/groups/${id}/members`, { email });
        addedMembers.push(member);
      } catch (err) {
        failedMembers.push({ member, reason: err.response?.data?.detail || 'Failed to add member' });
      }
    }

    return {
      id: String(updatedGroup.id),
      name: updatedGroup.name,
      description: updatedGroup.description || '',
      members: ['You', ...addedMembers],
      createdDate: safeFormatDate(updatedGroup.created_at),
      totalExpenses: 0,
      failedMembers
    };
  },

  deleteGroup: async (id) => {
    const response = await API.delete(`/groups/${id}`);
    return response.data;
  },
  
  addMember: async (groupId, email) => {
    const response = await API.post(`/groups/${groupId}/members`, { email });
    return response.data;
  },
  
  removeMember: async (groupId, username) => {
    // DELETE with body is used to identify the member by username
    const response = await API.delete(`/groups/${groupId}/members`, { data: { username } });
    return response.data;
  }
};

export default groupService;
