import { useEffect, useState } from 'react';
import { 
  TicketCheck, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useBetStore } from '../stores/betStore';
import { BetStatus, ReportData } from '../types';
import { formatCurrency, formatPercentage } from '../utils/dateUtils';
import { generateReportData } from '../utils/reportUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { bets, events, customers } = useBetStore();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  useEffect(() => {
    // Get current date
    const now = new Date();
    
    // Set start date to 7 days ago
    const startDate = new Date();
    startDate.setDate(now.getDate() - 7);
    
    // Generate report data for the last 7 days
    const data = generateReportData(bets, customers, {
      startDate,
      endDate: now
    });
    
    setReportData(data);
  }, [bets, customers]);
  
  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }
  
  // Count open bets
  const openBets = bets.filter(bet => bet.status === BetStatus.OPEN);
  const recentBets = [...bets]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  
  // Count upcoming events
  const upcomingEvents = events.filter(event => 
    event.status === EventStatus.UPCOMING || 
    event.status === EventStatus.LIVE
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Welcome, {user?.firstName || user?.username}
        </h2>
        <div className="text-sm text-gray-400">
          Last 7 Days Overview
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">Total Wagers</h3>
            <div className="p-2 bg-blue-900/30 rounded-full">
              <TicketCheck size={20} className="text-blue-300" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(reportData.totalWagered)}</p>
          <p className="text-sm text-gray-400">From {reportData.totalBets} bets</p>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">House Profit</h3>
            {reportData.houseProfit >= 0 ? (
              <div className="p-2 bg-green-900/30 rounded-full">
                <TrendingUp size={20} className="text-green-300" />
              </div>
            ) : (
              <div className="p-2 bg-red-900/30 rounded-full">
                <TrendingDown size={20} className="text-red-300" />
              </div>
            )}
          </div>
          <p className={`text-2xl font-bold ${reportData.houseProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {formatCurrency(reportData.houseProfit)}
          </p>
          <p className="text-sm text-gray-400">
            {reportData.houseProfitPercentage >= 0 
              ? `${formatPercentage(reportData.houseProfitPercentage)} profit margin`
              : `${formatPercentage(Math.abs(reportData.houseProfitPercentage))} loss margin`
            }
          </p>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">Open Bets</h3>
            <div className="p-2 bg-yellow-900/30 rounded-full">
              <Clock size={20} className="text-yellow-300" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{openBets.length}</p>
          <p className="text-sm text-gray-400">
            Potential payouts: {formatCurrency(openBets.reduce((sum, bet) => sum + bet.potentialPayout, 0))}
          </p>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-sm">Upcoming Events</h3>
            <div className="p-2 bg-purple-900/30 rounded-full">
              <Calendar size={20} className="text-purple-300" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
          <p className="text-sm text-gray-400">
            Active selections: {upcomingEvents.reduce((sum, event) => sum + event.selections.length, 0)}
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Daily Betting Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                  formatter={(value) => [`$${value}`, '']}
                />
                <Legend />
                <Bar 
                  name="Wagers" 
                  dataKey="wagerAmount" 
                  fill="#60A5FA" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  name="Payouts" 
                  dataKey="paidOut" 
                  fill="#F87171" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  name="Profit" 
                  dataKey="profit" 
                  fill="#34D399" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
          <div className="space-y-4">
            {reportData.topCustomers.slice(0, 3).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{customer.name}</p>
                  <p className="text-sm text-gray-400">{customer.totalBets} bets</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatCurrency(customer.totalWagered)}</p>
                  <p className={`text-sm ${customer.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {customer.netProfit >= 0 ? '+' : ''}{formatCurrency(customer.netProfit)}
                  </p>
                </div>
              </div>
            ))}
            <div className="text-center">
              <a 
                href="/reports" 
                className="text-sm text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                View full customer report
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent bets */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Bets</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-3 px-2">ID</th>
                <th className="pb-3 px-2">Customer</th>
                <th className="pb-3 px-2">Type</th>
                <th className="pb-3 px-2">Wager</th>
                <th className="pb-3 px-2">Potential</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBets.map((bet) => (
                <tr key={bet.id} className="border-t border-gray-800 text-sm">
                  <td className="py-3 px-2 text-gray-300">{bet.id.substring(0, 8)}</td>
                  <td className="py-3 px-2 text-white">{bet.customerName}</td>
                  <td className="py-3 px-2 text-gray-300">{bet.type}</td>
                  <td className="py-3 px-2 text-white">{formatCurrency(bet.wagerAmount)}</td>
                  <td className="py-3 px-2 text-primary">{formatCurrency(bet.potentialPayout)}</td>
                  <td className="py-3 px-2">
                    <span className={`badge ${
                      bet.status === BetStatus.OPEN ? 'badge-info' :
                      bet.status === BetStatus.WON ? 'badge-success' :
                      bet.status === BetStatus.LOST ? 'badge-danger' :
                      'badge-warning'
                    }`}>
                      {bet.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <a 
                      href={`/manage?id=${bet.id}`}
                      className="text-sm text-primary hover:text-primary-hover hover:underline transition-colors"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Import required for the dashboard
import { Calendar } from 'lucide-react';
import { EventStatus } from '../types';

export default DashboardPage;