import { 
  Bet, 
  BetStatus, 
  Customer, 
  ReportData, 
  ReportFilter 
} from '../types';
import { formatDate } from './dateUtils';

/**
 * Generates report data from bets based on date range
 */
export const generateReportData = (
  bets: Bet[], 
  customers: Customer[],
  filter: ReportFilter
): ReportData => {
  // Filter bets by date range
  const filteredBets = bets.filter(bet => 
    bet.createdAt >= filter.startDate && 
    bet.createdAt <= filter.endDate
  );
  
  // Calculate totals
  const totalBets = filteredBets.length;
  const totalWagered = filteredBets.reduce((sum, bet) => sum + bet.wagerAmount, 0);
  const totalPaidOut = filteredBets
    .filter(bet => bet.status === BetStatus.WON)
    .reduce((sum, bet) => sum + bet.potentialPayout, 0);
  
  const houseProfit = totalWagered - totalPaidOut;
  const houseProfitPercentage = totalWagered > 0 
    ? (houseProfit / totalWagered) * 100 
    : 0;
  
  const avgBetAmount = totalBets > 0 
    ? totalWagered / totalBets 
    : 0;
  
  // Get bet counts by status
  const betsByStatus = [
    BetStatus.OPEN, 
    BetStatus.CLOSED, 
    BetStatus.WON, 
    BetStatus.LOST,
    BetStatus.VOIDED
  ].map(status => {
    const statusBets = filteredBets.filter(bet => bet.status === status);
    return {
      status,
      count: statusBets.length,
      amount: statusBets.reduce((sum, bet) => sum + bet.wagerAmount, 0)
    };
  });
  
  // Get top customers
  const topCustomers = [...customers]
    .sort((a, b) => b.totalWagered - a.totalWagered)
    .slice(0, 5);
  
  // Generate daily stats
  const dailyMap = new Map<string, {
    date: string;
    betsPlaced: number;
    wagerAmount: number;
    paidOut: number;
    profit: number;
  }>();
  
  // Initialize daily stats with 0 values for all days in range
  let currentDate = new Date(filter.startDate);
  while (currentDate <= filter.endDate) {
    const dateKey = formatDate(currentDate);
    dailyMap.set(dateKey, {
      date: dateKey,
      betsPlaced: 0,
      wagerAmount: 0,
      paidOut: 0,
      profit: 0
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Fill in actual data
  filteredBets.forEach(bet => {
    const dateKey = formatDate(bet.createdAt);
    const currentStats = dailyMap.get(dateKey);
    
    if (currentStats) {
      const paidOut = bet.status === BetStatus.WON ? bet.potentialPayout : 0;
      
      dailyMap.set(dateKey, {
        ...currentStats,
        betsPlaced: currentStats.betsPlaced + 1,
        wagerAmount: currentStats.wagerAmount + bet.wagerAmount,
        paidOut: currentStats.paidOut + paidOut,
        profit: currentStats.profit + bet.wagerAmount - paidOut
      });
    }
  });
  
  const dailyStats = Array.from(dailyMap.values());
  
  return {
    totalBets,
    totalWagered,
    totalPaidOut,
    houseProfit,
    houseProfitPercentage,
    avgBetAmount,
    topCustomers,
    betsByStatus,
    dailyStats
  };
};

/**
 * Calculate week-over-week changes
 */
export const calculateWoWChanges = (
  currentData: ReportData, 
  previousData: ReportData
) => {
  return {
    betsChange: calculatePercentageChange(currentData.totalBets, previousData.totalBets),
    wagerChange: calculatePercentageChange(currentData.totalWagered, previousData.totalWagered),
    profitChange: calculatePercentageChange(currentData.houseProfit, previousData.houseProfit),
    avgBetChange: calculatePercentageChange(currentData.avgBetAmount, previousData.avgBetAmount)
  };
};

/**
 * Calculate percentage change between two values
 */
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};