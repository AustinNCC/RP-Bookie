// User & Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  lastLogin?: Date;
  // Track employee performance
  betsProcessed: number;
  totalBetAmount: number;
  uniqueCustomers: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

// Betting Types
export interface Bet {
  id: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
  status: BetStatus;
  type: BetType;
  wagerAmount: number;
  potentialPayout: number;
  selections: BetSelection[];
  notes?: string;
}

export enum BetStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  WON = 'WON',
  LOST = 'LOST',
  VOIDED = 'VOIDED'
}

export enum BetType {
  SINGLE = 'SINGLE',
  PARLAY = 'PARLAY'
}

export interface BetSelection {
  id: string;
  eventId: string;
  eventName: string;
  selectionName: string;
  odds: number;
  status: SelectionStatus;
}

export enum SelectionStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  VOIDED = 'VOIDED'
}

export interface Event {
  id: string;
  name: string;
  category: string;
  startTime?: Date;
  endTime?: Date;
  status: EventStatus;
  selections: EventSelection[];
  // Track betting volume and risk
  totalWagered: number;
  selectionVolume: { [selectionId: string]: number };
  lastOddsUpdate: Date;
}

export enum EventStatus {
  UPCOMING = 'UPCOMING',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface EventSelection {
  id: string;
  name: string;
  odds: number;
  initialOdds: number; // Store initial odds for reference
  status: SelectionStatus;
  volume: number; // Track betting volume
}

export interface Customer {
  id: string;
  name: string;
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  lastBet?: Date;
  balance: number; // Track customer balance
}

// Report Types
export interface ReportFilter {
  startDate: Date;
  endDate: Date;
}

export interface ReportData {
  totalBets: number;
  totalWagered: number;
  totalPaidOut: number;
  houseProfit: number;
  houseProfitPercentage: number;
  avgBetAmount: number;
  topCustomers: Customer[];
  betsByStatus: {
    status: BetStatus;
    count: number;
    amount: number;
  }[];
  dailyStats: {
    date: string;
    betsPlaced: number;
    wagerAmount: number;
    paidOut: number;
    profit: number;
  }[];
  // Employee performance metrics
  employeeStats: {
    employeeId: string;
    employeeName: string;
    betsProcessed: number;
    payoutAccuracy: number;
    customerRating: number;
  }[];
}

// Receipt Types
export interface Receipt {
  betId: string;
  timestamp: Date;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  type: BetType;
  selections: BetSelection[];
  wagerAmount: number;
  potentialPayout: number;
}

// Dynamic Odds Configuration
export interface OddsConfig {
  volumeThreshold: number; // Amount that triggers odds adjustment
  maxAdjustment: number; // Maximum percentage to adjust odds
  adjustmentInterval: number; // Minimum time between adjustments (ms)
  houseEdge: number; // Target house edge percentage
}