import React from 'react';
import { useBetStore } from '../../stores/betStore';
import { formatCurrency } from '../../utils/dateUtils';

interface CustomerBalanceDisplayProps {
  customerId: string;
}

const CustomerBalanceDisplay: React.FC<CustomerBalanceDisplayProps> = ({ 
  customerId 
}) => {
  const { getCustomerBalance } = useBetStore();
  const balance = getCustomerBalance(customerId);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">Balance:</span>
      <span className={`font-medium ${
        balance >= 0 ? 'text-green-400' : 'text-red-400'
      }`}>
        {formatCurrency(balance)}
      </span>
    </div>
  );
};

export default CustomerBalanceDisplay;