import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash, 
  FileText, 
  DollarSign, 
  TrendingUp,
  X,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useBetStore } from '../stores/betStore';
import { Customer, Bet, BetStatus } from '../types';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../utils/dateUtils';
import BalanceActions from '../components/customers/BalanceActions';

const CustomersPage: React.FC = () => {
  const { customers, bets, createCustomer, updateCustomerBalance } = useBetStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    creditLimit: '',
    notes: ''
  });
  
  // Transaction form state
  const [transactionData, setTransactionData] = useState({
    type: 'deposit',
    amount: '',
    notes: ''
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      idNumber: '',
      creditLimit: '',
      notes: ''
    });
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle transaction input changes
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle add customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    
    createCustomer(formData.name);
    setShowAddModal(false);
    resetForm();
  };
  
  // Handle process transaction
  const handleProcessTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || !transactionData.amount) return;
    
    const amount = parseFloat(transactionData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const finalAmount = transactionData.type === 'deposit' ? amount : -amount;
    updateCustomerBalance(selectedCustomer.id, finalAmount);
    
    setShowTransactionModal(false);
    setTransactionData({
      type: 'deposit',
      amount: '',
      notes: ''
    });
  };
  
  // Get customer bets
  const getCustomerBets = (customerId: string): Bet[] => {
    return bets
      .filter(bet => bet.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };
  
  // Calculate customer metrics
  const calculateMetrics = (customerId: string) => {
    const customerBets = getCustomerBets(customerId);
    const totalBets = customerBets.length;
    const wonBets = customerBets.filter(bet => bet.status === BetStatus.WON).length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    
    return {
      totalBets,
      wonBets,
      winRate
    };
  };
  
  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.id.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Customer Management</h2>
        <button 
          className="btn-primary flex items-center gap-2"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <UserPlus size={18} />
          <span>Add Customer</span>
        </button>
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {filteredCustomers.map((customer) => {
          const metrics = calculateMetrics(customer.id);
          const customerBets = getCustomerBets(customer.id);
          
          return (
            <div key={customer.id} className="card">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{customer.name}</h3>
                  <p className="text-sm text-gray-400">ID: {customer.id}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="card !bg-gray-800/30">
                      <p className="text-sm text-gray-400">Balance</p>
                      <p className={`text-lg font-semibold ${
                        customer.balance >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(customer.balance)}
                      </p>
                    </div>
                    
                    <div className="card !bg-gray-800/30">
                      <p className="text-sm text-gray-400">Total Wagered</p>
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(customer.totalWagered)}
                      </p>
                    </div>
                    
                    <div className="card !bg-gray-800/30">
                      <p className="text-sm text-gray-400">Net Profit</p>
                      <p className={`text-lg font-semibold ${
                        customer.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(customer.netProfit)}
                      </p>
                    </div>
                    
                    <div className="card !bg-gray-800/30">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-lg font-semibold text-white">
                        {metrics.winRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <BalanceActions
                    customerId={customer.id}
                    customerName={customer.name}
                  />
                  
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setFormData({
                        name: customer.name,
                        email: '',
                        phone: '',
                        idNumber: '',
                        creditLimit: '',
                        notes: ''
                      });
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={18} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
              
              {customerBets.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm">
                          <th className="pb-3 px-4">Date</th>
                          <th className="pb-3 px-4">Type</th>
                          <th className="pb-3 px-4">Wager</th>
                          <th className="pb-3 px-4">Payout</th>
                          <th className="pb-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {customerBets.slice(0, 5).map((bet) => (
                          <tr key={bet.id}>
                            <td className="py-3 px-4 text-gray-300">
                              {formatRelativeTime(bet.createdAt)}
                            </td>
                            <td className="py-3 px-4 text-white">
                              {bet.type}
                            </td>
                            <td className="py-3 px-4 text-white">
                              {formatCurrency(bet.wagerAmount)}
                            </td>
                            <td className="py-3 px-4 text-primary">
                              {formatCurrency(bet.potentialPayout)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`badge ${
                                bet.status === BetStatus.WON ? 'badge-success' :
                                bet.status === BetStatus.LOST ? 'badge-danger' :
                                bet.status === BetStatus.VOIDED ? 'badge-warning' :
                                'badge-info'
                              }`}>
                                {bet.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Add New Customer</h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="label">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="label">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="idNumber" className="label">ID Number</label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="creditLimit" className="label">Credit Limit</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      id="creditLimit"
                      name="creditLimit"
                      value={formData.creditLimit}
                      onChange={handleInputChange}
                      className="input pl-7"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="label">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input h-24 resize-none"
                  />
                </div>
                
                <div>
                  <label className="label">ID Verification</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload size={24} className="mx-auto text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-hover">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Edit Customer</h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="p-4">
              {/* Same form fields as Add Customer Modal */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Transaction Modal */}
      {showTransactionModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Process Transaction</h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowTransactionModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProcessTransaction} className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="transactionType" className="label">Transaction Type</label>
                  <select
                    id="transactionType"
                    name="type"
                    value={transactionData.type}
                    onChange={handleTransactionChange}
                    className="input"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdraw">Withdraw</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="amount" className="label">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={transactionData.amount}
                      onChange={handleTransactionChange}
                      className="input pl-7"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="transactionNotes" className="label">Notes</label>
                  <textarea
                    id="transactionNotes"
                    name="notes"
                    value={transactionData.notes}
                    onChange={handleTransactionChange}
                    className="input h-24 resize-none"
                    placeholder="Add any relevant notes..."
                  />
                </div>
                
                <div className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg">
                  <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Current Balance: {formatCurrency(selectedCustomer.balance)}</p>
                    <p>New Balance: {formatCurrency(
                      selectedCustomer.balance + (
                        transactionData.type === 'deposit'
                          ? parseFloat(transactionData.amount) || 0
                          : -(parseFloat(transactionData.amount) || 0)
                      )
                    )}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowTransactionModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Process Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;