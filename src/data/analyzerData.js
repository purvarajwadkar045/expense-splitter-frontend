import analyticsService from '../services/analyticsService';
import expenseService from '../services/expenseService';

// ─── Category Colors ─────────────────────────────────────────────────────────

export const CATEGORY_COLORS = {
  Food:          '#6366f1',
  Travel:        '#a855f7',
  Hotel:         '#8b5cf6',
  Shopping:      '#06b6d4',
  Bills:         '#10b981',
  Entertainment: '#f59e0b',
  Fuel:          '#ef4444',
  Rent:          '#8b5cf6',
  Medical:       '#ec4899',
  Education:     '#14b8a6',
  Other:         '#64748b',
};

// ─── Filter Options ───────────────────────────────────────────────────────────

export const DATE_RANGE_OPTIONS = [
  { value: 'this-week',     label: 'This Week' },
  { value: 'this-month',    label: 'This Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'this-year',     label: 'This Year' },
];

export const CATEGORY_OPTIONS = [
  { value: 'all',           label: 'All Categories' },
  { value: 'food',          label: 'Food' },
  { value: 'travel',        label: 'Travel' },
  { value: 'hotel',          label: 'Hotel' },
  { value: 'shopping',      label: 'Shopping' },
  { value: 'bills',         label: 'Bills' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'fuel',          label: 'Fuel' },
  { value: 'rent',          label: 'Rent' },
  { value: 'medical',       label: 'Medical' },
  { value: 'education',     label: 'Education' },
  { value: 'other',         label: 'Other' },
];

const formatInsightAmount = (amount) => `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const buildInsights = (insights) => {
  if (insights.expense_count === 0) return [];

  const cards = [];
  const change = insights.monthly_change;
  if (change.percentage !== null) {
    cards.push({
      id: 'monthly-change',
      label: 'Spending Trend',
      title: `${change.direction === 'increase' ? '+' : ''}${change.percentage}%`,
      value: change.direction === 'no_change' ? 'No change' : `Compared with previous month`,
      sub: `${formatInsightAmount(change.current)} this period`,
      icon: change.direction === 'decrease' ? 'trending-down' : 'trending-up',
      color: change.direction === 'decrease' ? 'var(--success)' : 'var(--warning)',
      glow: change.direction === 'decrease' ? 'var(--success-glow)' : 'rgba(245,158,11,0.12)',
    });
  }
  if (insights.top_category) {
    cards.push({
      id: 'top-category',
      label: 'Top Category',
      title: insights.top_category.category,
      value: `${formatInsightAmount(insights.top_category.amount)} spent`,
      sub: `${insights.top_category.percentage}% of total spending`,
      icon: 'pie-chart',
      color: 'var(--primary)',
      glow: 'var(--primary-glow)',
    });
  }
  cards.push({
    id: 'average-expense',
    label: 'Average Expense',
    title: formatInsightAmount(insights.average_expense),
    value: 'per transaction',
    sub: `Based on ${insights.expense_count} expenses`,
    icon: 'bar-chart-2',
    color: 'var(--accent)',
    glow: 'var(--accent-glow)',
  });
  if (insights.highest_expense) {
    cards.push({
      id: 'highest-expense',
      label: 'Largest Expense',
      title: formatInsightAmount(insights.highest_expense.amount),
      value: insights.highest_expense.description,
      sub: 'Highest transaction in this period',
      icon: 'trending-up',
      color: 'var(--error)',
      glow: 'rgba(239,68,68,0.12)',
    });
  }
  if (insights.most_frequent_category) {
    cards.push({
      id: 'frequent-category',
      label: 'Most Frequent Category',
      title: insights.most_frequent_category.category,
      value: `${insights.most_frequent_category.count} expenses`,
      sub: 'Most common expense category',
      icon: 'pie-chart',
      color: 'var(--secondary)',
      glow: 'var(--secondary-glow)',
    });
  }
  if (insights.top_group) {
    cards.push({
      id: 'top-group',
      label: 'Highest Spending Group',
      title: insights.top_group.group_name,
      value: formatInsightAmount(insights.top_group.amount),
      sub: 'Highest group spending in this period',
      icon: 'user-check',
      color: 'var(--success)',
      glow: 'var(--success-glow)',
    });
  }
  if (insights.budget && insights.budget.status !== 'not_set') {
    cards.push({
      id: 'budget-usage',
      label: 'Budget Usage',
      title: `${insights.budget.percentage_used}% used`,
      value: insights.budget.status.replace('_', ' '),
      sub: `${formatInsightAmount(insights.budget.remaining)} remaining`,
      icon: 'bar-chart-2',
      color: insights.budget.status === 'exceeded' ? 'var(--error)' : 'var(--success)',
      glow: insights.budget.status === 'exceeded' ? 'rgba(239,68,68,0.12)' : 'var(--success-glow)',
    });
  }
  return cards;
};

// ─── Main data fetching function ──────────────────────────────────────────────
/**
 * getAnalyzerData
 *
 * @param {Object} filters - { dateRange, group, category, member }
 * @returns {Promise<Object>}
 */
export async function getAnalyzerData(filters = {}) {
  const optionFilters = {};
  const groupOptionsResponse = await analyticsService.getGroups(optionFilters);
  const memberOptionsResponse = await analyticsService.getMembers(optionFilters);
  const selectedGroup = groupOptionsResponse.groups.find((group) => (
    filters.group !== 'all' && group.group_name.toLowerCase().replace(/\s/g, '-') === filters.group
  ));
  const selectedMember = memberOptionsResponse.members.find((member) => (
    filters.member !== 'all' && member.name.toLowerCase().replace(/\s/g, '-') === filters.member
  ));
  const apiFilters = {
    ...filters,
    groupId: selectedGroup?.group_id,
    memberId: selectedMember?.user_id,
  };
  const summary = await analyticsService.getSummary(apiFilters);
  const categoryResponse = await analyticsService.getCategories(apiFilters);
  const monthlyResponse = await analyticsService.getMonthly(apiFilters);
  const memberResponse = await analyticsService.getMembers(apiFilters);
  const groupResponse = await analyticsService.getGroups(apiFilters);
  const budgetResponse = await analyticsService.getBudget();
  const insightsResponse = await analyticsService.getInsights(apiFilters);
  const heatmapResponse = await analyticsService.getHeatmap(apiFilters);
  const topExpensesResponse = await analyticsService.getTopExpenses(apiFilters);
  const expensesByGroup = await Promise.all(groupOptionsResponse.groups.map(
    (group) => expenseService.getExpensesByGroupId(group.group_id, apiFilters),
  ));
  const monthlyTrend = monthlyResponse.months.map((item) => ({
    month: item.month,
    amount: item.total,
  }));
  const monthlyStats = {
    peak: monthlyResponse.peak_month
      ? { month: monthlyResponse.peak_month.month, amount: monthlyResponse.peak_month.total }
      : null,
    lowest: monthlyResponse.lowest_month
      ? { month: monthlyResponse.lowest_month.month, amount: monthlyResponse.lowest_month.total }
      : null,
    average: monthlyResponse.average_monthly_spending,
    monthlyChange: monthlyResponse.months.at(-1)?.change_percentage ?? null,
  };
  const memberDetails = memberResponse.members.map((member, index) => ({
    userId: member.user_id,
    name: member.name,
    paid: member.paid,
    owes: member.owes,
    net: member.net,
    expenseCount: member.expense_count,
    avatar: member.name.charAt(0).toUpperCase(),
    color: ['#6366f1', '#a855f7', '#06b6d4', '#10b981'][index % 4],
  }));
  const groupDetails = Object.fromEntries(groupResponse.groups.map((group) => [
    group.group_name,
    {
      members: group.member_count,
      expenseCount: group.expense_count,
      totalExpenses: group.total_expenses,
      averageExpense: group.average_expense,
      highestExpense: group.highest_expense?.description || '—',
      highestAmount: group.highest_expense?.amount || 0,
    },
  ]));
  const topExpenses = topExpensesResponse.expenses.map((expense) => ({
    id: expense.expense_id,
    expense: expense.description,
    amount: expense.amount,
    date: new Date(expense.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    category: expense.category,
    paidBy: expense.payer.name,
    group: expense.group.name,
  }));
  const recentExpenses = expensesByGroup.flat()
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .map((expense) => ({
      id: expense.id,
      expense: expense.title,
      group: expense.groupName,
      paidBy: expense.paidBy,
      category: expense.category,
      amount: expense.amount,
      date: new Date(expense.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }));
  const groupAverage = memberResponse.members.length
    ? memberResponse.members.reduce((total, member) => total + member.paid, 0) / memberResponse.members.length
    : 0;
  const spendingComparison = groupAverage > 0 ? {
    mySpending: summary.my_spending,
    groupAverage,
    percentageDiff: Math.round(((summary.my_spending - groupAverage) / groupAverage) * 100),
  } : null;

  return {
    secondaryStats: summary.total_transactions > 0 ? {
      averageExpense: summary.average_expense,
      highestExpense: summary.highest_expense,
      highestExpenseName: topExpenses[0]?.expense || '',
      lowestExpense: summary.lowest_expense,
      lowestExpenseName: insightsResponse.lowest_expense?.description || '',
      totalSettlements: summary.total_settlements,
      pendingBalance: summary.pending_balance,
    } : null,
    spendingTrend: monthlyTrend,
    monthlyStats,
    memberSpending: memberDetails.map((member) => ({
      name: member.name,
      amount: member.paid,
      color: member.color,
    })),
    memberDetails,
    memberHighlights: {
      mostActive: memberResponse.most_active_member,
      highestPayer: memberResponse.highest_payer,
      highestDebtor: memberResponse.highest_debtor,
    },
    groupSpending: groupResponse.groups.filter((group) => group.expense_count > 0).map((group) => ({
      group: group.group_name,
      amount: group.total_expenses,
    })),
    groupDetails,
    budget: budgetResponse,
    insights: buildInsights(insightsResponse),
    heatmap: heatmapResponse,
    topExpenses,
    recentExpenses,
    spendingComparison,
    filterOptions: {
      groups: groupOptionsResponse.groups.map((group) => ({
        value: group.group_name.toLowerCase().replace(/\s/g, '-'),
        label: group.group_name,
      })),
      members: memberOptionsResponse.members.map((member) => ({
        value: member.name.toLowerCase().replace(/\s/g, '-'),
        label: member.name,
      })),
    },
    categoryBreakdown: categoryResponse.categories.map((item) => ({
      name: item.category,
      amount: item.total_amount,
      percent: item.percentage,
      color: CATEGORY_COLORS[item.category] || '#64748b',
    })),
    summary: {
      totalExpenses: summary.total_expenses,
      mySpending: summary.my_spending,
      iOwe: summary.i_owe,
      iAmOwed: summary.i_am_owed,
      totalTransactions: summary.total_transactions,
      totalGroups: summary.total_groups,
      averageExpense: summary.average_expense,
      highestExpense: summary.highest_expense,
      lowestExpense: summary.lowest_expense,
      totalSettlements: summary.total_settlements,
      pendingBalance: summary.pending_balance,
    },
  };
}
