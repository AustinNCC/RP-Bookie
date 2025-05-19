import React from 'react';
import { ChevronDown, DollarSign, X } from 'lucide-react';
import { BetStatus } from '../../types';

interface SettlementOptionsProps {
  onSettle: (status: BetStatus, creditToBalance: boolean) => void;
  onCancel: () => void;
}

const SettlementOptions: React.FC<SettlementOptionsProps> = ({
  onSettle,
  onCancel
}) => {
  const [creditToBalance, setCreditToBalance] = React.useState(false);
  
  return (
    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Settle Bet</h3>
        <button
          className="text-gray-400 hover:text-white"
          onClick={onCancel}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={creditToBalance}
            onChange={(e) => setCreditToBalance(e.target.checked)}
            className="rounded border-gray-600 text-primary focus:ring-primary"
          />
          <span className="text-white flex items-center gap-1">
            <DollarSign size={16} />
            Credit winnings to balance
          </span>
        </label>
        
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-green-300 hover:bg-gray-800 rounded"
            onClick={() => onSettle(BetStatus.WON, creditToBalance)}
          >
            Mark as Won
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-red-300 hover:bg-gray-800 rounded"
            onClick={() => onSettle(BetStatus.LOST, creditToBalance)}
          >
            Mark as Lost
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-yellow-300 hover:bg-gray-800 rounded"
            onClick={() => onSettle(BetStatus.VOIDED, creditToBalance)}
          >
            Void Bet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementOptions;