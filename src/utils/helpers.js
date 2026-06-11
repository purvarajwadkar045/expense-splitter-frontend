/**
 * Formats a raw date string into a localized clean date
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Calculates net balances among members and applies a greedy matching algorithm
 * to reduce and simplify transaction directions.
 * 
 * members: array of strings (names)
 * expenses: array of expense objects in the group
 * settlements: array of completed settlement repayments in the group
 */
export const calculateSimplifiedDebts = (members, expenses = [], settlements = []) => {
  if (!members || members.length === 0) return [];

  // 1. Initialize net balance tracker for each user
  const netBalances = {};
  members.forEach(member => {
    netBalances[member] = 0;
  });

  // 2. Add shares paid vs owed from expenses
  expenses.forEach(exp => {
    const payer = exp.paidBy;
    const amount = Number(exp.amount) || 0;
    
    // Add amount paid by the payer
    if (netBalances[payer] !== undefined) {
      netBalances[payer] += amount;
    }

    // Subtract shares for each participant
    const shares = exp.shares || {};
    Object.entries(shares).forEach(([participant, shareAmount]) => {
      if (netBalances[participant] !== undefined) {
        netBalances[participant] -= Number(shareAmount) || 0;
      }
    });
  });

  // 3. Adjust net balances for completed settlements
  settlements.forEach(settle => {
    const debtor = settle.from;
    const creditor = settle.to;
    const amount = Number(settle.amount) || 0;

    if (netBalances[debtor] !== undefined) {
      netBalances[debtor] += amount; // Reduces their debt
    }
    if (netBalances[creditor] !== undefined) {
      netBalances[creditor] -= amount; // Reduces their credit
    }
  });

  // 4. Divide members into Creditors (net > 0) and Debtors (net < 0)
  const creditors = [];
  const debtors = [];

  Object.entries(netBalances).forEach(([name, balance]) => {
    const roundedBalance = Math.round(balance * 100) / 100; // avoid floating point issues
    if (roundedBalance > 0.1) {
      creditors.push({ name, balance: roundedBalance });
    } else if (roundedBalance < -0.1) {
      debtors.push({ name, balance: Math.abs(roundedBalance) });
    }
  });

  // 5. Greedy Debt Simplification Matcher
  const simplifiedPayments = [];

  // Sort creditors descending, debtors descending
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const minAmount = Math.min(creditor.balance, debtor.balance);
    const roundedPayment = Math.round(minAmount * 100) / 100;

    if (roundedPayment > 0) {
      simplifiedPayments.push({
        from: debtor.name,
        to: creditor.name,
        amount: roundedPayment
      });
    }

    creditor.balance -= roundedPayment;
    debtor.balance -= roundedPayment;

    // Check if settled
    if (Math.round(creditor.balance * 100) / 100 <= 0.05) {
      cIdx++;
    }
    if (Math.round(debtor.balance * 100) / 100 <= 0.05) {
      dIdx++;
    }

    // Re-sort to maintain greedy matching
    if (cIdx < creditors.length) creditors.slice(cIdx).sort((a, b) => b.balance - a.balance);
    if (dIdx < debtors.length) debtors.slice(dIdx).sort((a, b) => b.balance - a.balance);
  }

  return {
    netBalances,
    simplifiedPayments
  };
};

/**
 * Compiles a raw string arrays structure and triggers download as CSV file
 */
export const exportToCSV = (filename, headers, rows) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
