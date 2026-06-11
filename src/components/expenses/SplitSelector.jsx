import React, { useEffect, useState } from 'react';
import { MdCheckCircle, MdError } from 'react-icons/md';

const SplitSelector = ({ members = [], amount = 0, splitType = 'equal', shares = {}, onChange }) => {
  const [customShares, setCustomShares] = useState({});
  const totalAmount = Number(amount) || 0;

  // Initialize shares on mount or when members change or splitType changes
  useEffect(() => {
    if (splitType === 'equal') {
      const equalShare = totalAmount > 0 ? Math.round((totalAmount / members.length) * 100) / 100 : 0;
      const newShares = {};
      members.forEach((m) => {
        newShares[m] = equalShare;
      });
      
      // Adjust last member share slightly for rounding errors if totalAmount > 0
      if (totalAmount > 0) {
        const sumShares = Object.values(newShares).reduce((a, b) => a + b, 0);
        const difference = totalAmount - sumShares;
        if (difference !== 0 && members.length > 0) {
          const lastMember = members[members.length - 1];
          newShares[lastMember] = Math.round((newShares[lastMember] + difference) * 100) / 100;
        }
      }
      onChange(newShares);
    } else {
      // Custom split: initialize with existing shares or default to 0
      const newShares = {};
      members.forEach((m) => {
        newShares[m] = shares[m] !== undefined ? Number(shares[m]) : 0;
      });
      setCustomShares(newShares);
      onChange(newShares);
    }
  }, [members, splitType, totalAmount]);

  const handleCustomShareChange = (member, value) => {
    const numericVal = value === '' ? '' : Number(value);
    const updated = {
      ...customShares,
      [member]: numericVal
    };
    setCustomShares(updated);
    
    // Pass normalized values (0 instead of empty string) to parent
    const normalized = {};
    Object.keys(updated).forEach(k => {
      normalized[k] = updated[k] === '' ? 0 : Number(updated[k]);
    });
    onChange(normalized);
  };

  const getSumOfCustomShares = () => {
    return Object.values(customShares).reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  const currentSum = splitType === 'equal' ? totalAmount : getSumOfCustomShares();
  const isBalanced = Math.abs(currentSum - totalAmount) < 0.1;
  const roundedSum = Math.round(currentSum * 100) / 100;
  const difference = Math.round((totalAmount - currentSum) * 100) / 100;

  return (
    <div className="split-selector-box">
      <h4 className="split-selector-title">
        Split Details ({splitType === 'equal' ? 'Equal' : 'Custom'})
      </h4>

      {splitType === 'equal' ? (
        <div className="equal-split-info">
          {members.map((member) => {
            const share = totalAmount > 0 ? Math.round((totalAmount / members.length) * 100) / 100 : 0;
            return (
              <div key={member} className="split-member-row">
                <div className="split-member-info">
                  <div className="split-member-avatar">
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <span className="split-member-name">{member}</span>
                </div>
                <div className="split-share-amount">
                  ₹{share.toFixed(2)}
                </div>
              </div>
            );
          })}
          
          <div className="split-validation-alert success">
            <MdCheckCircle size={16} />
            <span>Split is perfectly balanced equally at ₹{(totalAmount / (members.length || 1)).toFixed(2)} each.</span>
          </div>
        </div>
      ) : (
        <div className="custom-split-info">
          {members.map((member) => (
            <div key={member} className="split-member-row">
              <div className="split-member-info">
                <div className="split-member-avatar">
                  {member.charAt(0).toUpperCase()}
                </div>
                <span className="split-member-name">{member}</span>
              </div>
              <div className="split-member-input-box">
                <span className="split-currency-symbol">₹</span>
                <input
                  type="number"
                  className="split-member-input"
                  placeholder="0.00"
                  step="any"
                  value={customShares[member] === undefined ? '' : customShares[member]}
                  onChange={(e) => handleCustomShareChange(member, e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="split-totals-row">
            <span>Total Entered: <strong>₹{roundedSum.toFixed(2)}</strong></span>
            <span>Target Total: <strong>₹{totalAmount.toFixed(2)}</strong></span>
          </div>

          {isBalanced ? (
            <div className="split-validation-alert success">
              <MdCheckCircle size={16} />
              <span>Split matches the total amount exactly!</span>
            </div>
          ) : (
            <div className="split-validation-alert error">
              <MdError size={16} />
              <span>
                {difference > 0 
                  ? `Under-allocated: Add ₹${difference.toFixed(2)} more.`
                  : `Over-allocated: Remove ₹${Math.abs(difference).toFixed(2)}.`
                }
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SplitSelector;
