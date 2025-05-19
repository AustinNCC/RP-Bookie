import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock as Shamrock, Plus, Trash, Receipt, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useBetStore } from '../stores/betStore';
import { 
  Bet, 
  BetSelection, 
  BetStatus, 
  BetType, 
  Event, 
  EventStatus,
  SelectionStatus,
  Customer
} from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { createReceiptFromBet, generateReceipt } from '../utils/receiptUtils';
import BetSlip from '../components/betting/BetSlip';
import CustomerBalanceDisplay from '../components/betting/CustomerBalanceDisplay';

const BettingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    events, 
    customers, 
    createBet,
    calculatePotentialPayout,
    createCustomer
  } = useBetStore();
  const navigate = useNavigate();
  
  const [betType, setBetType] = useState<BetType>(BetType.SINGLE);
  const [customerId, setCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [wagerAmount, setWagerAmount] = useState<string>('');
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [receiptText, setReceiptText] = useState<string>('');
  const [errors, setErrors] = useState<{
    customer?: string;
    wager?: string;
    selections?: string;
  }>({});
  
  // Filter events that are available for betting
  const availableEvents = events.filter(
    event => event.status === EventStatus.UPCOMING || 
    event.status === EventStatus.LIVE
  );
  
  // Calculate potential payout
  const potentialPayout = calculatePotentialPayout(
    parseFloat(wagerAmount) || 0,
    selections,
    betType
  );
  
  // Handle selection click
  const handleSelectionClick = (event: Event, selectionId: string) => {
    // For single bets, replace the selection
    if (betType === BetType.SINGLE) {
      const selection = event.selections.find(s => s.id === selectionId);
      if (!selection) return;
      
      setSelections([
        {
          id: selection.id,
          eventId: event.id,
          eventName: event.name,
          selectionName: selection.name,
          odds: selection.odds,
          status: SelectionStatus.PENDING
        }
      ]);
    } else {
      // For parlays, add to selections if not already added
      // Check if we already have a selection from this event
      const existingSelectionIndex = selections.findIndex(
        s => s.eventId === event.id
      );
      
      const selection = event.selections.find(s => s.id === selectionId);
      if (!selection) return;
      
      if (existingSelectionIndex >= 0) {
        // Replace the existing selection for this event
        const newSelections = [...selections];
        newSelections[existingSelectionIndex] = {
          id: selection.id,
          eventId: event.id,
          eventName: event.name,
          selectionName: selection.name,
          odds: selection.odds,
          status: SelectionStatus.PENDING
        };
        setSelections(newSelections);
      } else {
        // Add new selection
        setSelections([
          ...selections,
          {
            id: selection.id,
            eventId: event.id,
            eventName: event.name,
            selectionName: selection.name,
            odds: selection.odds,
            status: SelectionStatus.PENDING
          }
        ]);
      }
    }
  };
  
  // Remove a selection
  const removeSelection = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };
  
  // Reorder selections
  const handleReorderSelections = (newOrder: BetSelection[]) => {
    setSelections(newOrder);
  };
  
  // Handle add new customer
  const handleAddCustomer = () => {
    if (!newCustomerName.trim()) {
      setErrors({ ...errors, customer: 'Customer name is required' });
      return;
    }
    
    const id = createCustomer(newCustomerName);
    setCustomerId(id);
    setShowNewCustomerForm(false);
    setNewCustomerName('');
    setErrors({ ...errors, customer: undefined });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    const validationErrors: typeof errors = {};
    
    if (!customerId) {
      validationErrors.customer = 'Please select a customer';
    }
    
    if (!wagerAmount || parseFloat(wagerAmount) <= 0) {
      validationErrors.wager = 'Please enter a valid wager amount';
    }
    
    if (selections.length === 0) {
      validationErrors.selections = 'Please select at least one option';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Find customer name
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Create bet
    const betId = createBet({
      customerId,
      customerName: customer.name,
      employeeId: user?.id || '',
      status: BetStatus.OPEN,
      type: betType,
      wagerAmount: parseFloat(wagerAmount),
      potentialPayout,
      selections
    });
    
    // Navigate to manage page to see the created bet
    navigate(`/manage?id=${betId}`);
  };
  
  // Generate receipt preview
  const previewReceipt = () => {
    if (!customerId || !wagerAmount || selections.length === 0) {
      handleSubmit(); // This will set errors
      return;
    }
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Create a temporary bet object for the receipt
    const tempBet: Bet = {
      id: 'PREVIEW-' + Date.now().toString(36),
      customerId,
      customerName: customer.name,
      employeeId: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: BetStatus.OPEN,
      type: betType,
      wagerAmount: parseFloat(wagerAmount),
      potentialPayout,
      selections
    };
    
    const receipt = createReceiptFromBet(tempBet, user?.username || 'Employee');
    const receiptText = generateReceipt(receipt);
    
    setReceiptText(receiptText);
    setShowReceiptPreview(true);
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create Bet</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bet details form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Bet Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Bet Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`btn ${
                      betType === BetType.SINGLE ? 'btn-primary' : 'btn-secondary'
                    }`}
                    onClick={() => setBetType(BetType.SINGLE)}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      betType === BetType.PARLAY ? 'btn-primary' : 'btn-secondary'
                    }`}
                    onClick={() => setBetType(BetType.PARLAY)}
                  >
                    Parlay
                  </button>
                </div>
              </div>
              
              {showNewCustomerForm ? (
                <div>
                  <label htmlFor="newCustomerName" className="label">
                    New Customer Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="newCustomerName"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="input"
                      placeholder="Enter customer name"
                    />
                    <button
                      type="button"
                      className="btn-primary whitespace-nowrap"
                      onClick={handleAddCustomer}
                    >
                      Add
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-white mt-1"
                    onClick={() => setShowNewCustomerForm(false)}
                  >
                    Cancel
                  </button>
                  {errors.customer && (
                    <p className="text-red-400 text-sm mt-1">{errors.customer}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="customer" className="label">
                    Customer
                  </label>
                  <div className="flex flex-col">
                    <select
                      id="customer"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="input"
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="text-sm text-primary hover:text-primary-hover mt-1"
                      onClick={() => setShowNewCustomerForm(true)}
                    >
                      + Add new customer
                    </button>
                  </div>
                  {errors.customer && (
                    <p className="text-red-400 text-sm mt-1">{errors.customer}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <BetSlip
              selections={selections}
              betType={betType}
              wagerAmount={wagerAmount}
              customerId={customerId}
              potentialPayout={potentialPayout}
              onRemoveSelection={removeSelection}
              onReorderSelections={handleReorderSelections}
              onWagerChange={setWagerAmount}
              onSubmit={handleSubmit}
              onPreviewReceipt={previewReceipt}
            />
            {errors.selections && (
              <p className="text-red-400 text-sm mt-2">{errors.selections}</p>
            )}
          </div>
        </div>
        
        {/* Available events */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Available Events</h3>
            
            {availableEvents.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-gray-400">No events available for betting</p>
              </div>
            ) : (
              <div className="space-y-6">
                {availableEvents.map((event) => (
                  <div key={event.id} className="border border-gray-700/50 rounded-lg overflow-hidden">
                    <div className="bg-gray-800/70 p-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-white">{event.name}</h4>
                        <span className="badge badge-info">{event.category}</span>
                      </div>
                      {event.startTime && (
                        <p className="text-sm text-gray-400 mt-1">
                          Starts: {event.startTime.toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 p-3">
                      {event.selections.map((selection) => (
                        <button
                          key={selection.id}
                          type="button"
                          className={`p-3 rounded-lg border transition-colors ${
                            selections.some(s => s.id === selection.id)
                              ? 'bg-primary/20 border-primary text-white'
                              : 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-800/50'
                          }`}
                          onClick={() => handleSelectionClick(event, selection.id)}
                        >
                          <div className="flex justify-between items-center">
                            <span>{selection.name}</span>
                            <span className="font-semibold text-primary">
                              {selection.odds}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Receipt Preview Modal */}
      {showReceiptPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Receipt Preview</h3>
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
                onClick={() => setShowReceiptPreview(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
              >
                Create Bet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingPage;