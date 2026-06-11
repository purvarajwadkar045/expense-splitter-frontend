import { MdFastfood, MdFlight, MdHome, MdWork, MdCasino, MdMoreHoriz } from 'react-icons/md';

export const CATEGORIES = [
  { id: 'Food', label: 'Food & Drinks', icon: MdFastfood, color: '#f43f5e' },
  { id: 'Travel', label: 'Trips & Travel', icon: MdFlight, color: '#06b6d4' },
  { id: 'Shelter', label: 'Rent & Living', icon: MdHome, color: '#10b981' },
  { id: 'Office', label: 'Work & Office', icon: MdWork, color: '#6366f1' },
  { id: 'Leisure', label: 'Fun & Games', icon: MdCasino, color: '#a855f7' },
  { id: 'Others', label: 'Miscellaneous', icon: MdMoreHoriz, color: '#9ca3af' }
];

export const INITIAL_GROUPS = [
  {
    id: 'g1',
    name: 'Flatmates 302',
    description: 'Monthly apartment splits and living expenses.',
    members: ['You', 'Rahul Sharma', 'Priya Patel', 'David Miller'],
    createdDate: '2026-01-10',
    totalExpenses: 28500
  },
  {
    id: 'g2',
    name: 'Goa Summer Trip',
    description: 'College buddies trip across south Goa beaches.',
    members: ['You', 'Rahul Sharma', 'Priya Patel', 'Charlie Green'],
    createdDate: '2026-05-12',
    totalExpenses: 45000
  },
  {
    id: 'g3',
    name: 'Office Lunch Crew',
    description: 'Daily splits for office food orders.',
    members: ['You', 'Amit Gupta', 'Sneha Reddy'],
    createdDate: '2026-05-18',
    totalExpenses: 3400
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'e1',
    groupId: 'g1',
    title: 'High-speed Fiber Broadband',
    amount: 1200,
    paidBy: 'Rahul Sharma',
    date: '2026-05-01',
    category: 'Shelter',
    notes: 'Airtel broadband connection bill.',
    splitType: 'equal',
    shares: { 'You': 300, 'Rahul Sharma': 300, 'Priya Patel': 300, 'David Miller': 300 }
  },
  {
    id: 'e2',
    groupId: 'g1',
    title: 'Bi-weekly Organic Groceries',
    amount: 3200,
    paidBy: 'You',
    date: '2026-05-15',
    category: 'Food',
    notes: 'Vegetables and dairy items from Nature\'s Basket.',
    splitType: 'equal',
    shares: { 'You': 800, 'Rahul Sharma': 800, 'Priya Patel': 800, 'David Miller': 800 }
  },
  {
    id: 'e3',
    groupId: 'g2',
    title: 'Luxury Villa Booking',
    amount: 24000,
    paidBy: 'You',
    date: '2026-05-14',
    category: 'Travel',
    notes: 'Advance booking for 3 nights villa near Candolim.',
    splitType: 'custom',
    shares: { 'You': 6000, 'Rahul Sharma': 6000, 'Priya Patel': 6000, 'Charlie Green': 6000 }
  },
  {
    id: 'e4',
    groupId: 'g2',
    title: 'Premium Seafood Lunch',
    amount: 8000,
    paidBy: 'Priya Patel',
    date: '2026-05-16',
    category: 'Food',
    notes: 'Lunch and drinks at Britto\'s Shack.',
    splitType: 'equal',
    shares: { 'You': 2000, 'Rahul Sharma': 2000, 'Priya Patel': 2000, 'Charlie Green': 2000 }
  }
];

export const INITIAL_SETTLEMENTS = [
  {
    id: 's1',
    groupId: 'g1',
    from: 'Priya Patel',
    to: 'You',
    amount: 800,
    date: '2026-05-16',
    method: 'UPI'
  }
];
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'group',
    message: 'You were added to group <strong>Office Lunch Crew</strong>',
    time: '2h ago',
    unread: true
  },
  {
    id: 'n2',
    type: 'expense',
    message: 'Rahul Sharma added <strong>Fiber Broadband</strong> in Flatmates 302',
    time: '3d ago',
    unread: false
  },
  {
    id: 'n3',
    type: 'settlement',
    message: 'Priya Patel settled <strong>₹800</strong> with you',
    time: '6d ago',
    unread: false
  }
];
