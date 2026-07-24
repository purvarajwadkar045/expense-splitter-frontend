import API from './api';

const getStoredGroups = () => {
  const stored = localStorage.getItem('groups');
  if (!stored) {
    return [];
  }
  return JSON.parse(stored);
};

const saveGroups = (groups) => {
  localStorage.setItem('groups', JSON.stringify(groups));
};

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
  getGroups: () => {
    return getStoredGroups();
  },

  getGroupById: (id) => {
    const groups = getStoredGroups();
    return groups.find(g => String(g.id) === String(id)) || null;
  },

  createGroup: async (name, description, members = []) => {
    // 1. Post group creation to backend
    const response = await API.post('/groups', {
      name,
      description
    });
    
    const createdGroup = response.data; // returns GroupResponse { id, name, description, created_by, created_at }
    const groupId = createdGroup.id;

    // 2. Add members to group on the backend using the add member endpoint
    const addedMembers = [];
    for (const member of members) {
      if (member === 'You') continue;
      const email = getEmailForName(member);
      try {
        await API.post(`/groups/${groupId}/members`, { email });
        addedMembers.push(member);
      } catch (err) {
        console.warn(`Failed to add member ${member} (${email}) to backend:`, err);
        // Fallback: keep them in frontend storage for UI consistency
        addedMembers.push(member);
      }
    }

    // 3. Save to localStorage to synchronize read operations
    const frontendGroup = {
      id: String(groupId),
      name: createdGroup.name,
      description: createdGroup.description || '',
      members: ['You', ...addedMembers],
      createdDate: new Date(createdGroup.created_at).toISOString().split('T')[0],
      totalExpenses: 0
    };

    const storedGroups = getStoredGroups();
    saveGroups([frontendGroup, ...storedGroups]);

    return frontendGroup;
  },

  updateGroup: async (id, groupData) => {
    const storedGroups = getStoredGroups();
    const existingGroup = storedGroups.find(g => String(g.id) === String(id));
    if (!existingGroup) return null;

    const newMembers = groupData.members || [];
    const addedMembers = [];
    
    for (const member of newMembers) {
      if (member === 'You') continue;
      const email = getEmailForName(member);
      const wasMember = existingGroup.members.includes(member);
      
      if (!wasMember) {
        try {
          await API.post(`/groups/${id}/members`, { email });
        } catch (err) {
          console.warn(`Failed to add member ${member} to backend:`, err);
        }
      }
      addedMembers.push(member);
    }

    let updatedGroup = null;
    const updated = storedGroups.map(g => {
      if (String(g.id) === String(id)) {
        updatedGroup = {
          ...g,
          name: groupData.name || g.name,
          description: groupData.description !== undefined ? groupData.description : g.description,
          members: ['You', ...addedMembers]
        };
        return updatedGroup;
      }
      return g;
    });

    saveGroups(updated);
    return updatedGroup;
  },

  deleteGroup: async (id) => {
    // Delete is not exposed as a backend endpoint, so we prune locally
    const storedGroups = getStoredGroups();
    const filtered = storedGroups.filter(g => String(g.id) !== String(id));
    saveGroups(filtered);
    return true;
  },

  addMember: async (groupId, email) => {
    const response = await API.post(`/groups/${groupId}/members`, { email });
    
    // Sync locally
    const storedGroups = getStoredGroups();
    const updated = storedGroups.map(g => {
      if (String(g.id) === String(groupId)) {
        const memberName = email.split('@')[0];
        const cleanMembers = [...new Set([...g.members, memberName])];
        return { ...g, members: cleanMembers };
      }
      return g;
    });
    saveGroups(updated);

    return response.data;
  }
};

export default groupService;
