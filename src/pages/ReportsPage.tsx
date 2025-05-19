import { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Download 
} from 'lucide-react';
import { useBetStore } from '../stores/betStore';
import { ReportData, ReportFilter } from '../types';
import { 
  formatDate, 
  formatCurrency, 
  formatPercentage, 
  getReportStartDate, 
  getReportEndDate 
} from '../utils/dateUtils';
import { generateReportData, calculateWoWChanges } from '../utils/reportUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Colors for charts
const COLORS = ['#00F8B9', '#60A5FA', '#F87171', '#FCD34D', '#A78BFA'];

const ReportsPage: React.FC = () => {
  const { bets, customers } = useBetStore();
  
  const [timeRange, setTimeRange] = useState<number>(1); // Default to 1 week
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [previousData, setPreviousData] = useState<ReportData | null>(null);
  const [wowChanges, setWowChanges] = useState<{
    betsChange: number;
    wagerChange: number;
    profitChange: number;
    avgBetChange: number;
  } | null>(null);
  
  // Generate report data
  useEffect(() => {
    if (!bets.length) return;
    
    const endDate = getReportEndDate(); // Today
    const startDate = getReportStartDate(timeRange); // X weeks ago
    
    // Generate current period report
    const data = generateReportData(bets, customers, { startDate, endDate });
    setReportData(data);
    
    // Generate previous period report (for week over week comparison)
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousEndDate.getDate() - (timeRange * 7)); // Same duration as current period
    
    const prevData = generateReportData(bets, customers, { 
      startDate: previousStartDate, 
      endDate: previousEndDate 
    });
    setPreviousData(prevData);
    
    // Calculate week over week changes
    const changes = calculateWoWChanges(data, prevData);
    setWowChanges(changes);
    
  }, [bets, customers, timeRange]);
  
  const getChangeIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUp size={16} className="text-green-400" />;
    } else if (value < 0) {
      return <ArrowDown size={16} className="text-red-400" />;
    }
    return null;
  };
  
  // Format status data for pie chart
  const getStatusChartData = () => {
    if (!reportData) return [];
    
    return reportData.betsByStatus.map(item => ({
      name: item.status,
      value: item.amount
    }));
  };
  
  if (!reportData || !previousData || !wowChanges) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading report data...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">House Reports</h2>
        
        <div className="flex gap-4">
          <select
            className="input"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
          >
            <option value={1}>Last Week</option>
            <option value={2}>Last 2 Weeks</option>
            <option value={3}>Last 3 Weeks</option>
            <option value={4}>Last 4 Weeks</option>
          </select>
          
          <button 
            className="btn-primary flex items-center gap-2"
            onClick={() => {
              alert('Report downloaded (demo)');
            }}
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            Overview for {formatDate(getReportStartDate(timeRange))} - {formatDate(getReportEndDate())}
          </h3>
          <p className="text-sm text-gray-400">Week-over-week comparison</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-900/30 rounded-full">
                  <BarChart3 size={20} className="text-blue-300" />
                </div>
                <h4 className="text-gray-400 text-sm">Total Bets</h4>
              </div>
              {wowChanges.betsChange !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  wowChanges.betsChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getChangeIcon(wowChanges.betsChange)}
                  {Math.abs(wowChanges.betsChange).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{reportData.totalBets}</p>
            <p className="text-sm text-gray-400">
              Avg. {formatCurrency(reportData.avgBetAmount)} per bet
            </p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-900/30 rounded-full">
                  <DollarSign size={20} className="text-green-300" />
                </div>
                <h4 className="text-gray-400 text-sm">Total Wagers</h4>
              </div>
              {wowChanges.wagerChange !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  wowChanges.wagerChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getChangeIcon(wowChanges.wagerChange)}
                  {Math.abs(wowChanges.wagerChange).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(reportData.totalWagered)}</p>
            <p className="text-sm text-gray-400">
              Paid out: {formatCurrency(reportData.totalPaidOut)}
            </p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-900/30 rounded-full">
                  <TrendingUp size={20} className="text-purple-300" />
                </div>
                <h4 className="text-gray-400 text-sm">House Profit</h4>
              </div>
              {wowChanges.profitChange !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  wowChanges.profitChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getChangeIcon(wowChanges.profitChange)}
                  {Math.abs(wowChanges.profitChange).toFixed(1)}%
                </div>
              )}
            </div>
            <p className={`text-2xl font-bold ${
              reportData.houseProfit >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {formatCurrency(reportData.houseProfit)}
            </p>
            <p className="text-sm text-gray-400">
              {reportData.houseProfitPercentage >= 0 
                ? `${formatPercentage(reportData.houseProfitPercentage)} margin`
                : `${formatPercentage(Math.abs(reportData.houseProfitPercentage))} loss rate`
              }
            </p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-900/30 rounded-full">
                  <Users size={20} className="text-yellow-300" />
                </div>
                <h4 className="text-gray-400 text-sm">Top Customer</h4>
              </div>
            </div>
            {reportData.topCustomers.length > 0 ? (
              <>
                <p className="text-xl font-semibold text-white truncate">
                  {reportData.topCustomers[0].name}
                </p>
                <p className="text-sm text-gray-400">
                  Wagered: {formatCurrency(reportData.topCustomers[0].totalWagered)}
                </p>
              </>
            ) : (
              <p className="text-gray-400">No customer data</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Daily Betting Activity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.dailyStats}>
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
                <Line 
                  type="monotone" 
                  name="Wager Amount" 
                  dataKey="wagerAmount" 
                  stroke="#00F8B9" 
                  strokeWidth={2} 
                  dot={{ stroke: '#00F8B9', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#00F8B9', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  name="Profit" 
                  dataKey="profit" 
                  stroke="#60A5FA" 
                  strokeWidth={2} 
                  dot={{ stroke: '#60A5FA', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#60A5FA', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Bets by Status</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getStatusChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getStatusChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), '']}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-3 px-4">Customer</th>
                <th className="pb-3 px-4">Total Bets</th>
                <th className="pb-3 px-4">Total Wagered</th>
                <th className="pb-3 px-4">Total Won</th>
                <th className="pb-3 px-4">Net Profit</th>
                <th className="pb-3 px-4">Last Bet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reportData.topCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="py-3 px-4 font-medium text-white">
                    {customer.name}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {customer.totalBets}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {formatCurrency(customer.totalWagered)}
                  </td>
                  <td className="py-3 px-4 text-green-300">
                    {formatCurrency(customer.totalWon)}
                  </td>
                  <td className={`py-3 px-4 font-medium ${
                    customer.netProfit > 0 ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {customer.netProfit > 0 ? '+' : ''}
                    {formatCurrency(customer.netProfit)}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {customer.lastBet 
                      ? formatDate(customer.lastBet)
                      : 'Never'
                    }
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

export default ReportsPage;