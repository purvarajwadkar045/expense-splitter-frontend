import { INITIAL_GROUPS } from '../utils/constants';

const getStoredGroups = () => {
  const stored = localStorage.getItem('groups');
  if (!stored) {
    localStorage.setItem('groups', JSON.stringify(INITIAL_GROUPS));
    return INITIAL_GROUPS;
  }
  return JSON.parse(stored);
};

const saveGroups = (groups) => {
  localStorage.setItem('groups', JSON.stringify(groups));
};

const groupService = {
  getGroups: () => {
    return getStoredGroups();
  },

  getGroupById: (id) => {
    const groups = getStoredGroups();
    return groups.find(g => g.id === id) || null;
  },

  createGroup: (name, description, members = []) => {
    const groups = getStoredGroups();
    // Force including 'You' if not present
    const cleanMembers = [...new Set(['You', ...members])];
    
    const newGroup = {
      id: `g_${Date.now()}`,
      name,
      description,
      members: cleanMembers,
      createdDate: new Date().toISOString().split('T')[0],
      totalExpenses: 0
    };

    const updated = [newGroup, ...groups];
    saveGroups(updated);
    return newGroup;
  },

  updateGroup: (id, groupData) => {
    const groups = getStoredGroups();
    let updatedGroup = null;
    
    const updated = groups.map(g => {
      if (g.id === id) {
        // Ensure "You" is always in the group members
        const cleanMembers = [...new Set(['You', ...(groupData.members || g.members)])];
        updatedGroup = { ...g, ...groupData, members: cleanMembers };
        return updatedGroup;
      }
      return g;
    });

    saveGroups(updated);
    return updatedGroup;
  },

  deleteGroup: (id) => {
    const groups = getStoredGroups();
    const filtered = groups.filter(g => g.id !== id);
    saveGroups(filtered);
    return true;
  }
};

export default groupService;
