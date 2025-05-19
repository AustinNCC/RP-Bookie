import React, { useState } from 'react';
import { DollarSign, Receipt, Clock } from 'lucide-react';
import { useBetStore } from '../../stores/betStore';
import { formatCurrency } from '../../utils/dateUtils';
import { Bet, BetStatus } from '../../types';

interface BalanceActionsProps {
  customerId: string;
  customerName: string;
}

const BalanceActions: React.FC<BalanceActionsProps> = ({ 
  customerId,
  customerName
}) => {
  const { bets, updateCustomerBalance } = useBetStore();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'credit' | 'payout'>('activity');
  const [selectedWins, setSelectedWins] = useState<Set<string>>(new Set());
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  
  // Get customer's winning bets that haven't been credited
  const winningBets = bets.filter(bet => 
    bet.customerId === customerId && 
    bet.status === BetStatus.WON
  );
  
  // Get all balance-related activity
  const balanceActivity = bets
    .filter(bet => bet.customerId === customerId)
    .map(bet => ({
      id: bet.id,
      date: bet.createdAt,
      type: bet.status === BetStatus.WON ? 'Credit' : 'Debit',
      amount: bet.status === BetStatus.WON ? bet.potentialPayout : -bet.wagerAmount,
      description: `${bet.type} bet ${bet.status.toLowerCase()}`
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Handle win selection
  const handleWinSelect = (betId: string) => {
    const newSelected = new Set(selectedWins);
    if (newSelected.has(betId)) {
      newSelected.delete(betId);
    } else {
      newSelected.add(betId);
    }
    setSelectedWins(newSelected);
  };
  
  // Handle credit to balance
  const handleCreditWins = () => {
    const totalCredit = winningBets
      .filter(bet => selectedWins.has(bet.id))
      .reduce((sum, bet) => sum + bet.potentialPayout, 0);
    
    if (totalCredit > 0) {
      updateCustomerBalance(customerId, totalCredit);
      setSelectedWins(new Set());
      setActiveTab('activity');
    }
  };
  
  // Handle payout
  const handlePayout = () => {
    if (payoutAmount > 0) {
      updateCustomerBalance(customerId, -payoutAmount);
      setPayoutAmount(0);
      setActiveTab('activity');
    }
  };
  
  return (
    <>
      <button
        className="btn-primary flex items-center gap-2"
        onClick={() => setShowModal(true)}
      >
        <DollarSign size={18} />
        Book Balance
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Book Balance - {customerName}
                </h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  className={`btn ${
                    activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  <Clock size={16} className="mr-1" />
                  Activity
                </button>
                <button
                  className={`btn ${
                    activeTab === 'credit' ? 'btn-primary' : 'btn-secondary'
                  }`}
                  onClick={() => setActiveTab('credit')}
                >
                  <DollarSign size={16} className="mr-1" />
                  Add Credit
                </button>
                <button
                  className={`btn ${
                    activeTab === 'payout' ? 'btn-primary' : 'btn-secondary'
                  }`}
                  onClick={() => setActiveTab('payout')}
                >
                  <Receipt size={16} className="mr-1" />
                  Payout
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {balanceActivity.map(activity => (
                    <div 
                      key={activity.id}
                      className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div>
                        <p className="text-white">{activity.description}</p>
                        <p className="text-sm text-gray-400">
                          {activity.date.toLocaleString()}
                        </p>
                      </div>
                      <span className={`font-medium ${
                        activity.type === 'Credit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {activity.type === 'Credit' ? '+' : '-'}
                        {formatCurrency(Math.abs(activity.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'credit' && (
                <div className="space-y-4">
                  {winningBets.map(bet => (
                    <div 
                      key={bet.id}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer ${
                        selectedWins.has(bet.id)
                          ? 'bg-primary/20 border border-primary'
                          : 'bg-gray-800/50'
                      }`}
                      onClick={() => handleWinSelect(bet.id)}
                    >
                      <div>
                        <p className="text-white">
                          {bet.type} Bet - {bet.selections.map(s => s.selectionName).join(', ')}
                        </p>
                        <p className="text-sm text-gray-400">
                          {bet.createdAt.toLocaleString()}
                        </p>
                      </div>
                      <span className="font-medium text-primary">
                        {formatCurrency(bet.potentialPayout)}
                      </span>
                    </div>
                  ))}
                  
                  {selectedWins.size > 0 && (
                    <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                      <span className="text-white">Total to Credit:</span>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(
                          winningBets
                            .filter(bet => selectedWins.has(bet.id))
                            .reduce((sum, bet) => sum + bet.potentialPayout, 0)
                        )}
                      </span>
                    </div>
                  )}
                  
                  <button
                    className="btn-primary w-full"
                    onClick={handleCreditWins}
                    disabled={selectedWins.size === 0}
                  >
                    Credit Selected Wins
                  </button>
                </div>
              )}
              
              {activeTab === 'payout' && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Payout Amount</label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, useBetStore.getState().getCustomerBalance(customerId))}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-400">$0</span>
                      <span className="text-primary font-semibold">
                        {formatCurrency(payoutAmount)}
                      </span>
                      <span className="text-gray-400">
                        {formatCurrency(useBetStore.getState().getCustomerBalance(customerId))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                    <span className="text-white">Remaining Balance:</span>
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(
                        useBetStore.getState().getCustomerBalance(customerId) - payoutAmount
                      )}
                    </span>
                  </div>
                  
                  <button
                    className="btn-primary w-full"
                    onClick={handlePayout}
                    disabled={payoutAmount <= 0}
                  >
                    Process Payout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BalanceActions;