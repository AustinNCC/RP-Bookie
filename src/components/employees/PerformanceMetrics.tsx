import React from 'react';
import { 
  BarChart3, 
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { User } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface PerformanceMetricsProps {
  user: User;
  averages: {
    betsProcessed: number;
    totalBetAmount: number;
    uniqueCustomers: number;
  };
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  user,
  averages
}) => {
  const getPerformanceColor = (value: number, average: number) => {
    const difference = ((value - average) / average) * 100;
    if (difference >= 5) return 'text-green-400';
    if (difference <= -5) return 'text-red-400';
    return 'text-yellow-400';
  };
  
  const getPerformanceIcon = (value: number, average: number) => {
    const difference = ((value - average) / average) * 100;
    if (difference >= 5) return <TrendingUp size={16} />;
    if (difference <= -5) return <TrendingDown size={16} />;
    return null;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card !bg-gray-800/30">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={20} className="text-blue-400" />
          <h4 className="text-gray-400">Bets Processed</h4>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-white">
            {user.betsProcessed}
          </p>
          <div className={`flex items-center gap-1 text-sm ${
            getPerformanceColor(user.betsProcessed, averages.betsProcessed)
          }`}>
            {getPerformanceIcon(user.betsProcessed, averages.betsProcessed)}
            <span>
              {Math.abs(
                ((user.betsProcessed - averages.betsProcessed) / averages.betsProcessed) * 100
              ).toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Avg: {averages.betsProcessed}
        </p>
      </div>
      
      <div className="card !bg-gray-800/30">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={20} className="text-green-400" />
          <h4 className="text-gray-400">Total Bet Amount</h4>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-white">
            {formatCurrency(user.totalBetAmount)}
          </p>
          <div className={`flex items-center gap-1 text-sm ${
            getPerformanceColor(user.totalBetAmount, averages.totalBetAmount)
          }`}>
            {getPerformanceIcon(user.totalBetAmount, averages.totalBetAmount)}
            <span>
              {Math.abs(
                ((user.totalBetAmount - averages.totalBetAmount) / averages.totalBetAmount) * 100
              ).toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Avg: {formatCurrency(averages.totalBetAmount)}
        </p>
      </div>
      
      <div className="card !bg-gray-800/30">
        <div className="flex items-center gap-2 mb-2">
          <Users size={20} className="text-purple-400" />
          <h4 className="text-gray-400">Unique Customers</h4>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-white">
            {user.uniqueCustomers}
          </p>
          <div className={`flex items-center gap-1 text-sm ${
            getPerformanceColor(user.uniqueCustomers, averages.uniqueCustomers)
          }`}>
            {getPerformanceIcon(user.uniqueCustomers, averages.uniqueCustomers)}
            <span>
              {Math.abs(
                ((user.uniqueCustomers - averages.uniqueCustomers) / averages.uniqueCustomers) * 100
              ).toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Avg: {averages.uniqueCustomers}
        </p>
      </div>
    </div>
  );
};

export default PerformanceMetrics;