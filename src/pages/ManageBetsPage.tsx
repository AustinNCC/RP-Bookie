import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  Receipt, 
  ChevronDown 
} from 'lucide-react';
import { useBetStore } from '../stores/betStore';
import { useAuthStore } from '../stores/authStore';
import { 
  Bet, 
  BetStatus, 
  BetType, 
  BetSelection, 
  SelectionStatus 
} from '../types';
import { formatDateTime, formatCurrency, formatRelativeTime } from '../utils/dateUtils';
import { createReceiptFromBet, generateReceipt } from '../utils/receiptUtils';

const ManageBetsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bets, settleBet, updateBetSelection, deleteBet } = useBetStore();
  const { user } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BetStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<BetType | 'ALL'>('ALL');
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [selectedBetSelections, setSelectedBetSelections] = useState<{
    [id: string]: SelectionStatus
  }>({});
  const [showBetDetails, setShowBetDetails] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptText, setReceiptText] = useState('');
  
  // Check if a specific bet ID was requested in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const betId = params.get('id');
    
    if (betId) {
      const bet = bets.find(b => b.id === betId);
      if (bet) {
        handleBetSelect(bet);
      }
    }
  }, [location.search, bets]);
  
  // Filter bets
  const filteredBets = bets.filter(bet => {
    // Apply status filter
    if (statusFilter !== 'ALL' && bet.status !== statusFilter) {
      return false;
    }
    
    // Apply type filter
    if (typeFilter !== 'ALL' && bet.type !== typeFilter) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        bet.id.toLowerCase().includes(searchLower) ||
        bet.customerName.toLowerCase().includes(searchLower) ||
        bet.selections.some(s => 
          s.eventName.toLowerCase().includes(searchLower) ||
          s.selectionName.toLowerCase().includes(searchLower)
        )
      );
    }
    
    return true;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Handle bet selection
  const handleBetSelect = (bet: Bet) => {
    setSelectedBet(bet);
    
    // Initialize selection states
    const selectionStates: {[id: string]: SelectionStatus} = {};
    bet.selections.forEach(selection => {
      selectionStates[selection.id] = selection.status;
    });
    
    setSelectedBetSelections(selectionStates);
    setShowBetDetails(true);
  };
  
  // Handle selection status update
  const handleSelectionStatusChange = (selectionId: string, status: SelectionStatus) => {
    setSelectedBetSelections({
      ...selectedBetSelections,
      [selectionId]: status
    });
  };
  
  // Save selection status changes
  const saveSelectionChanges = () => {
    if (!selectedBet) return;
    
    // Update all selections
    Object.entries(selectedBetSelections).forEach(([selectionId, status]) => {
      updateBetSelection(selectedBet.id, selectionId, status);
    });
    
    // Refresh selected bet
    const updatedBet = bets.find(b => b.id === selectedBet.id);
    if (updatedBet) {
      setSelectedBet(updatedBet);
    }
    
    // Close details view
    setShowBetDetails(false);
  };
  
  // Handle bet settlement
  const handleSettleBet = (status: BetStatus) => {
    if (!selectedBet) return;
    
    settleBet(selectedBet.id, status);
    
    // Refresh selected bet
    const updatedBet = bets.find(b => b.id === selectedBet.id);
    if (updatedBet) {
      setSelectedBet(updatedBet);
    }
    
    // Close details view
    setShowBetDetails(false);
  };
  
  // Handle bet deletion
  const handleDeleteBet = () => {
    if (!selectedBet) return;
    
    if (confirm('Are you sure you want to delete this bet? This action cannot be undone.')) {
      deleteBet(selectedBet.id);
      setSelectedBet(null);
      setShowBetDetails(false);
    }
  };
  
  // Generate and show receipt
  const viewReceipt = () => {
    if (!selectedBet) return;
    
    const receipt = createReceiptFromBet(
      selectedBet, 
      user?.firstName || user?.username || 'Employee'
    );
    
    const receiptText = generateReceipt(receipt);
    setReceiptText(receiptText);
    setShowReceiptModal(true);
  };
  
  // Get status icon
  const getStatusIcon = (status: BetStatus) => {
    switch (status) {
      case BetStatus.OPEN:
        return <Clock size={16} className="text-blue-400" />;
      case BetStatus.WON:
        return <Check size={16} className="text-green-400" />;
      case BetStatus.LOST:
        return <X size={16} className="text-red-400" />;
      case BetStatus.VOIDED:
        return <AlertTriangle size={16} className="text-yellow-400" />;
      default:
        return null;
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: BetStatus) => {
    switch (status) {
      case BetStatus.OPEN:
        return 'badge-info';
      case BetStatus.WON:
        return 'badge-success';
      case BetStatus.LOST:
        return 'badge-danger';
      case BetStatus.VOIDED:
        return 'badge-warning';
      default:
        return '';
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Bets</h2>
      </div>
      
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search by ID, customer, or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BetStatus | 'ALL')}
              >
                <option value="ALL">All Statuses</option>
                <option value={BetStatus.OPEN}>Open</option>
                <option value={BetStatus.WON}>Won</option>
                <option value={BetStatus.LOST}>Lost</option>
                <option value={BetStatus.VOIDED}>Voided</option>
              </select>
            </div>
            
            <div>
              <select
                className="input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as BetType | 'ALL')}
              >
                <option value="ALL">All Types</option>
                <option value={BetType.SINGLE}>Single</option>
                <option value={BetType.PARLAY}>Parlay</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          {filteredBets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No bets found matching your filters</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3 px-4">ID</th>
                  <th className="pb-3 px-4">Customer</th>
                  <th className="pb-3 px-4">Type</th>
                  <th className="pb-3 px-4">Created</th>
                  <th className="pb-3 px-4">Wager</th>
                  <th className="pb-3 px-4">Potential</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-800/30 cursor-pointer">
                    <td className="py-3 px-4 font-mono text-sm text-gray-300">
                      {bet.id.substring(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {bet.customerName}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {bet.type}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {formatRelativeTime(bet.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {formatCurrency(bet.wagerAmount)}
                    </td>
                    <td className="py-3 px-4 text-primary">
                      {formatCurrency(bet.potentialPayout)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadgeClass(bet.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(bet.status)}
                          {bet.status}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="text-primary hover:text-primary-hover"
                        onClick={() => handleBetSelect(bet)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Bet Details Modal */}
      {showBetDetails && selectedBet && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Bet Details
                <span className={`badge ${getStatusBadgeClass(selectedBet.status)}`}>
                  {selectedBet.status}
                </span>
              </h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowBetDetails(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">ID</p>
                  <p className="font-mono text-white">{selectedBet.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white">{selectedBet.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="text-white">{selectedBet.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="text-white">{formatDateTime(selectedBet.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Wager Amount</p>
                  <p className="text-white">{formatCurrency(selectedBet.wagerAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Potential Payout</p>
                  <p className="text-primary font-semibold">{formatCurrency(selectedBet.potentialPayout)}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Selections</h4>
                <div className="space-y-3">
                  {selectedBet.selections.map((selection) => (
                    <div 
                      key={selection.id}
                      className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-gray-400">{selection.eventName}</p>
                          <p className="font-medium text-white">{selection.selectionName}</p>
                          <p className="text-sm text-primary">Odds: {selection.odds}</p>
                        </div>
                        
                        {selectedBet.status === BetStatus.OPEN && (
                          <div>
                            <select
                              value={selectedBetSelections[selection.id]}
                              onChange={(e) => handleSelectionStatusChange(
                                selection.id, 
                                e.target.value as SelectionStatus
                              )}
                              className="input text-sm py-1"
                            >
                              <option value={SelectionStatus.PENDING}>Pending</option>
                              <option value={SelectionStatus.WON}>Won</option>
                              <option value={SelectionStatus.LOST}>Lost</option>
                              <option value={SelectionStatus.VOIDED}>Voided</option>
                            </select>
                          </div>
                        )}
                        
                        {selectedBet.status !== BetStatus.OPEN && (
                          <span className={`badge ${
                            selection.status === SelectionStatus.WON ? 'badge-success' :
                            selection.status === SelectionStatus.LOST ? 'badge-danger' :
                            selection.status === SelectionStatus.VOIDED ? 'badge-warning' :
                            'badge-info'
                          }`}>
                            {selection.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedBet.notes && (
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Notes</h4>
                  <p className="text-gray-300 bg-gray-800/30 p-3 rounded-lg">
                    {selectedBet.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-700 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                className="btn-secondary flex items-center gap-1"
                onClick={viewReceipt}
              >
                <Receipt size={16} />
                Receipt
              </button>
              
              {selectedBet.status === BetStatus.OPEN && (
                <>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handleDeleteBet}
                  >
                    Delete
                  </button>
                  
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={saveSelectionChanges}
                  >
                    Save Changes
                  </button>
                  
                  <div className="relative group">
                    <button
                      type="button"
                      className="btn-primary flex items-center gap-1"
                    >
                      Settle Bet
                      <ChevronDown size={16} />
                    </button>
                    
                    <div className="absolute right-0 mt-1 w-36 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg hidden group-hover:block">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-green-300 hover:bg-gray-700"
                        onClick={() => handleSettleBet(BetStatus.WON)}
                      >
                        Mark as Won
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-red-300 hover:bg-gray-700"
                        onClick={() => handleSettleBet(BetStatus.LOST)}
                      >
                        Mark as Lost
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-yellow-300 hover:bg-gray-700"
                        onClick={() => handleSettleBet(BetStatus.VOIDED)}
                      >
                        Void Bet
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {selectedBet.status !== BetStatus.OPEN && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowBetDetails(false)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Bet Receipt</h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowReceiptModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <pre className="receipt overflow-auto whitespace-pre-wrap max-h-[400px]">
                {receiptText}
              </pre>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  // Simulate printing or copying to clipboard
                  navigator.clipboard.writeText(receiptText);
                  alert('Receipt copied to clipboard!');
                }}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBetsPage;