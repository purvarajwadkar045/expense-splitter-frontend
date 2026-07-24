// Mock service layer to simulate the backend. Stores data in localStorage for persistence.

const INITIAL_USERS = [
  { id: 1, name: 'sakshi', email: 'sakshi12@gmail.com', joinedDate: '2026-06-18' },
  { id: 2, name: 'sakshi', email: 'sakshi123@gmail.com', joinedDate: '2026-06-18' },
  { id: 3, name: 'Rahul', email: 'rahul@gmail.com', joinedDate: '2026-06-18' },
  { id: 4, name: 'Priya', email: 'priya@gmail.com', joinedDate: '2026-06-19' },
  { id: 5, name: 'Aman', email: 'aman@gmail.com', joinedDate: '2026-06-15' },
  { id: 6, name: 'Neha', email: 'neha@gmail.com', joinedDate: '2026-06-15' },
  { id: 7, name: 'Vikram', email: 'vikram@gmail.com', joinedDate: '2026-06-20' },
  { id: 8, name: 'Shreya', email: 'shreya@gmail.com', joinedDate: '2026-06-20' },
  { id: 9, name: 'Amit', email: 'amit@gmail.com', joinedDate: '2026-06-20' },
];

const INITIAL_GROUPS = [
  { id: 'g1', name: 'Trip to Goa', description: 'All expenses for Goa vacation', members: ['You', 'Rahul', 'Priya'] },
  { id: 'g2', name: 'Roommates', description: 'Monthly rent and utilities', members: ['You', 'Aman', 'Neha'] },
  { id: 'g3', name: 'Office Lunch', description: 'Friday team lunches', members: ['You', 'Vikram', 'Shreya', 'Amit'] }
];

const INITIAL_EXPENSES = [
  { id: 'e1', groupId: 'g1', title: 'Villa Booking', amount: 12000, paidBy: 'You', splitType: 'equal', category: 'Lodging', date: '2026-06-18', notes: 'Airbnb downpayment', shares: {} },
  { id: 'e2', groupId: 'g1', title: 'Dinner at Curlies', amount: 4000, paidBy: 'Rahul', splitType: 'equal', category: 'Food', date: '2026-06-19', notes: 'Drinks & seafood', shares: {} },
  { id: 'e3', groupId: 'g1', title: 'Cab ride', amount: 1500, paidBy: 'Priya', splitType: 'equal', category: 'Transport', date: '2026-06-20', notes: 'Airport pickup', shares: {} },
  { id: 'e4', groupId: 'g2', title: 'WiFi Bill', amount: 1200, paidBy: 'You', splitType: 'equal', category: 'Bills', date: '2026-06-15', notes: 'Airtel fiber 100 Mbps', shares: {} },
  { id: 'e5', groupId: 'g2', title: 'Groceries', amount: 3000, paidBy: 'Aman', splitType: 'equal', category: 'Food', date: '2026-06-16', notes: 'Supermarket stockup', shares: {} },
  { id: 'e6', groupId: 'g3', title: 'Pizza Party', amount: 2400, paidBy: 'Vikram', splitType: 'equal', category: 'Food', date: '2026-06-21', notes: 'Friday celebration', shares: {} }
];

const INITIAL_SETTLEMENTS = [
  { id: 's1', groupId: 'g1', from: 'Rahul', to: 'You', amount: 3000, date: '2026-06-20' },
  { id: 's2', groupId: 'g2', from: 'Neha', to: 'Aman', amount: 1000, date: '2026-06-17' }
];

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', title: 'Added to group', message: 'Rahul added you to <strong>Trip to Goa</strong>', date: '2026-06-18', isRead: false },
  { id: 'n2', title: 'New expense', message: 'Rahul added expense <strong>"Dinner at Curlies"</strong> in <strong>Trip to Goa</strong>', date: '2026-06-19', isRead: false },
  { id: 'n3', title: 'Settlement recorded', message: 'Rahul settled <strong>₹3,000</strong> to you', date: '2026-06-20', isRead: true }
];

// Helper functions for localStorage
const getStored = (key, fallback) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Initialize localStorage values
const getDB = () => ({
  users: getStored('mock_users', INITIAL_USERS),
  groups: getStored('mock_groups', INITIAL_GROUPS),
  expenses: getStored('mock_expenses', INITIAL_EXPENSES),
  settlements: getStored('mock_settlements', INITIAL_SETTLEMENTS),
  notifications: getStored('mock_notifications', INITIAL_NOTIFICATIONS),
  currentUser: getStored('mock_current_user', { id: 1, name: 'sakshi', email: 'sakshi12@gmail.com', joinedDate: '2026-06-18' })
});

const saveDB = (db) => {
  setStored('mock_users', db.users);
  setStored('mock_groups', db.groups);
  setStored('mock_expenses', db.expenses);
  setStored('mock_settlements', db.settlements);
  setStored('mock_notifications', db.notifications);
  setStored('mock_current_user', db.currentUser);
};

// Simulate API delay
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));


export const mockGroupService = {
  getGroups: async () => {
    await delay(200);
    const db = getDB();
    return db.groups;
  },

  getGroupById: async (id) => {
    await delay(150);
    const db = getDB();
    return db.groups.find(g => g.id === id) || null;
  },

  createGroup: async (name, description, members = []) => {
    await delay(250);
    const db = getDB();
    // Ensure 'You' is a member
    const updatedMembers = [...new Set(['You', ...members])];
    const newGroup = {
      id: 'g' + Date.now(),
      name,
      description,
      members: updatedMembers
    };
    db.groups.push(newGroup);
    saveDB(db);
    return newGroup;
  },

  updateGroup: async (id, groupData) => {
    await delay(250);
    const db = getDB();
    db.groups = db.groups.map(g => {
      if (g.id === id) {
        return {
          ...g,
          name: groupData.name || g.name,
          description: groupData.description || g.description,
          members: groupData.members ? [...new Set(['You', ...groupData.members])] : g.members
        };
      }
      return g;
    });
    saveDB(db);
    return db.groups.find(g => g.id === id);
  },

  deleteGroup: async (id) => {
    await delay(200);
    const db = getDB();
    db.groups = db.groups.filter(g => g.id !== id);
    // Also delete associated expenses and settlements
    db.expenses = db.expenses.filter(e => e.groupId !== id);
    db.settlements = db.settlements.filter(s => s.groupId !== id);
    saveDB(db);
    return { message: 'Group deleted successfully' };
  }
};

export const mockExpenseService = {
  getExpenses: async (groupId = '') => {
    await delay(200);
    const db = getDB();
    if (groupId) {
      return db.expenses.filter(e => e.groupId === groupId);
    }
    return db.expenses;
  },

  getExpensesByGroupId: async (groupId) => {
    await delay(150);
    const db = getDB();
    return db.expenses.filter(e => e.groupId === groupId);
  },

  createExpense: async (expenseData) => {
    await delay(250);
    const db = getDB();
    const newExpense = {
      id: 'e' + Date.now(),
      groupId: expenseData.groupId,
      title: expenseData.title,
      amount: Number(expenseData.amount),
      paidBy: expenseData.paidBy || 'You',
      splitType: expenseData.splitType || 'equal',
      category: expenseData.category || 'Others',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      notes: expenseData.notes || '',
      shares: expenseData.shares || {}
    };
    db.expenses.push(newExpense);

    // Create a notification for this expense
    const groupName = db.groups.find(g => g.id === expenseData.groupId)?.name || 'a group';
    const newNotification = {
      id: 'n' + Date.now(),
      title: 'New expense',
      message: `<strong>${newExpense.paidBy}</strong> added expense <strong>"${newExpense.title}"</strong> in <strong>${groupName}</strong>`,
      date: newExpense.date,
      isRead: false
    };
    db.notifications.unshift(newNotification);

    saveDB(db);
    return newExpense;
  },

  updateExpense: async (id, expenseData) => {
    await delay(250);
    const db = getDB();
    db.expenses = db.expenses.map(e => {
      if (e.id === id) {
        return {
          ...e,
          title: expenseData.title || e.title,
          amount: Number(expenseData.amount) || e.amount,
          paidBy: expenseData.paidBy || e.paidBy,
          splitType: expenseData.splitType || e.splitType,
          category: expenseData.category || e.category,
          date: expenseData.date || e.date,
          notes: expenseData.notes || e.notes,
          shares: expenseData.shares || e.shares
        };
      }
      return e;
    });
    saveDB(db);
    return db.expenses.find(e => e.id === id);
  },

  deleteExpense: async (id) => {
    await delay(200);
    const db = getDB();
    db.expenses = db.expenses.filter(e => e.id !== id);
    saveDB(db);
    return { message: 'Expense deleted successfully' };
  }
};

export const mockSettlementService = {
  getSettlements: async () => {
    await delay(200);
    const db = getDB();
    return db.settlements;
  },

  getSettlementsByGroupId: async (groupId) => {
    await delay(150);
    const db = getDB();
    return db.settlements.filter(s => s.groupId === groupId);
  },

  createSettlement: async (settleData) => {
    await delay(250);
    const db = getDB();
    const newSettlement = {
      id: 's' + Date.now(),
      groupId: settleData.groupId,
      from: settleData.from,
      to: settleData.to,
      amount: Number(settleData.amount),
      date: settleData.date || new Date().toISOString().split('T')[0]
    };
    db.settlements.push(newSettlement);

    // Create a notification for this settlement
    const groupName = db.groups.find(g => g.id === settleData.groupId)?.name || 'a group';
    const newNotification = {
      id: 'n' + Date.now(),
      title: 'Settlement recorded',
      message: `<strong>${newSettlement.from}</strong> settled <strong>₹${newSettlement.amount.toLocaleString()}</strong> to <strong>${newSettlement.to}</strong> in <strong>${groupName}</strong>`,
      date: newSettlement.date,
      isRead: false
    };
    db.notifications.unshift(newNotification);

    saveDB(db);
    return newSettlement;
  }
};

export const mockNotificationService = {
  getNotifications: async () => {
    await delay(150);
    const db = getDB();
    return db.notifications;
  },

  markAllAsRead: async () => {
    await delay(150);
    const db = getDB();
    db.notifications = db.notifications.map(n => ({ ...n, isRead: true }));
    saveDB(db);
    return { message: 'All notifications marked as read' };
  },

  markAsRead: async (id) => {
    await delay(100);
    const db = getDB();
    db.notifications = db.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveDB(db);
    return { message: 'Notification marked as read' };
  },

  deleteNotification: async (id) => {
    await delay(150);
    const db = getDB();
    db.notifications = db.notifications.filter(n => n.id !== id);
    saveDB(db);
    return { message: 'Notification deleted successfully' };
  }
};
