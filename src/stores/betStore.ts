import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';
import { toast } from 'react-toastify';

import { 
  Bet, 
  BetSelection, 
  BetStatus, 
  BetType, 
  SelectionStatus,
  Event,
  EventStatus,
  EventSelection,
  Customer
} from '../types';
import { useAuthStore } from './authStore';
import { calculateDynamicOdds, updateEventOdds } from '../utils/oddsUtils';

interface BetState {
  bets: Bet[];
  events: Event[];
  customers: Customer[];
  activeBet: Bet | null;
  isLoading: boolean;
  
  // Bet management
  createBet: (bet: Omit<Bet, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBet: (id: string, updates: Partial<Bet>) => void;
  updateBetSelection: (betId: string, selectionId: string, status: SelectionStatus) => void;
  settleBet: (id: string, status: BetStatus, creditToBalance?: boolean) => void;
  deleteBet: (id: string) => void;
  
  // Event management
  createEvent: (event: Omit<Event, 'id'>) => string;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  updateEventSelection: (eventId: string, selectionId: string, updates: Partial<EventSelection>) => void;
  deleteEvent: (id: string) => void;
  
  // Customer management
  createCustomer: (name: string) => string;
  updateCustomerStats: (id: string, betAmount: number, winAmount: number) => void;
  updateCustomerBalance: (id: string, amount: number) => void;
  getCustomerBalance: (id: string) => number;
  
  // Calculations
  calculatePotentialPayout: (wagerAmount: number, selections: BetSelection[], betType: BetType) => number;
}

// Create some initial mock data
const createMockData = () => {
  // Generate mock events
  const events: Event[] = [
    {
      id: uuidv4(),
      name: 'Street Race - North Side',
      category: 'Racing',
      startTime: new Date(Date.now() + 3600000), // 1 hour from now
      status: EventStatus.UPCOMING,
      totalWagered: 0,
      selectionVolume: {},
      lastOddsUpdate: new Date(),
      selections: [
        { 
          id: uuidv4(), 
          name: 'May Maple', 
          odds: 2.5,
          initialOdds: 2.5,
          volume: 0,
          status: SelectionStatus.PENDING 
        },
        { 
          id: uuidv4(), 
          name: 'Eddie Marshall', 
          odds: 1.8,
          initialOdds: 1.8,
          volume: 0,
          status: SelectionStatus.PENDING 
        },
        { 
          id: uuidv4(), 
          name: 'Tommy Cruizer', 
          odds: 3.2,
          initialOdds: 3.2,
          volume: 0,
          status: SelectionStatus.PENDING 
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'Boxing Match - The Gym',
      category: 'Fighting',
      startTime: new Date(Date.now() + 7200000), // 2 hours from now
      status: EventStatus.UPCOMING,
      totalWagered: 0,
      selectionVolume: {},
      lastOddsUpdate: new Date(),
      selections: [
        { 
          id: uuidv4(), 
          name: 'Mike "Iron" Tyrone', 
          odds: 1.5,
          initialOdds: 1.5,
          volume: 0,
          status: SelectionStatus.PENDING 
        },
        { 
          id: uuidv4(), 
          name: 'Lenny "The Beast" Johnson', 
          odds: 2.7,
          initialOdds: 2.7,
          volume: 0,
          status: SelectionStatus.PENDING 
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'Blackjack Tournament - Diamond Casino',
      category: 'Casino',
      startTime: new Date(Date.now() + 10800000), // 3 hours from now
      status: EventStatus.UPCOMING,
      totalWagered: 0,
      selectionVolume: {},
      lastOddsUpdate: new Date(),
      selections: [
        { 
          id: uuidv4(), 
          name: 'Jack "Cards" Williams', 
          odds: 2.2,
          initialOdds: 2.2,
          volume: 0,
          status: SelectionStatus.PENDING 
        },
        { 
          id: uuidv4(), 
          name: 'Samantha Spades', 
          odds: 1.9,
          initialOdds: 1.9,
          volume: 0,
          status: SelectionStatus.PENDING 
        },
        { 
          id: uuidv4(), 
          name: 'Robert "Lucky" Jones', 
          odds: 2.8,
          initialOdds: 2.8,
          volume: 0,
          status: SelectionStatus.PENDING 
        },
        { 
          id: uuidv4(), 
          name: 'Any Other Player', 
          odds: 3.5,
          initialOdds: 3.5,
          volume: 0,
          status: SelectionStatus.PENDING 
        }
      ]
    }
  ];
  
  // Generate mock customers
  const customers: Customer[] = [
    {
      id: uuidv4(),
      name: 'Johnny Silverhand',
      totalBets: 15,
      totalWagered: 7500,
      totalWon: 6200,
      netProfit: -1300,
      balance: 1000
    },
    {
      id: uuidv4(),
      name: 'Claire Redfield',
      totalBets: 8,
      totalWagered: 4000,
      totalWon: 7800,
      netProfit: 3800,
      lastBet: new Date(Date.now() - 86400000), // 1 day ago
      balance: 2500
    },
    {
      id: uuidv4(),
      name: 'Max Payne',
      totalBets: 22,
      totalWagered: 11000,
      totalWon: 9500,
      netProfit: -1500,
      lastBet: new Date(Date.now() - 172800000), // 2 days ago
      balance: 500
    },
    {
      id: uuidv4(),
      name: 'Lara Croft',
      totalBets: 5,
      totalWagered: 2500,
      totalWon: 4800,
      netProfit: 2300,
      lastBet: new Date(),
      balance: 3000
    }
  ];
  
  // Create some example bets
  const johnnyId = customers[0].id;
  const claireId = customers[1].id;
  const maxId = customers[2].id;
  const laraId = customers[3].id;
  
  const bets: Bet[] = [
    // Johnny's bets
    {
      id: uuidv4(),
      customerId: johnnyId,
      customerName: 'Johnny Silverhand',
      employeeId: '3', // The employee user
      createdAt: new Date(Date.now() - 259200000), // 3 days ago
      updatedAt: new Date(Date.now() - 172800000), // 2 days ago
      status: BetStatus.LOST,
      type: BetType.SINGLE,
      wagerAmount: 500,
      potentialPayout: 750,
      selections: [
        {
          id: uuidv4(),
          eventId: events[0].id,
          eventName: 'Previous Street Race',
          selectionName: 'Tommy Cruizer',
          odds: 1.5,
          status: SelectionStatus.LOST
        }
      ]
    },
    {
      id: uuidv4(),
      customerId: johnnyId,
      customerName: 'Johnny Silverhand',
      employeeId: '3',
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      updatedAt: new Date(Date.now() - 86400000), // 1 day ago
      status: BetStatus.WON,
      type: BetType.PARLAY,
      wagerAmount: 1000,
      potentialPayout: 4200,
      selections: [
        {
          id: uuidv4(),
          eventId: events[1].id,
          eventName: 'Previous Boxing Match',
          selectionName: 'Mike "Iron" Tyrone',
          odds: 1.4,
          status: SelectionStatus.WON
        },
        {
          id: uuidv4(),
          eventId: events[2].id,
          eventName: 'Previous Casino Tournament',
          selectionName: 'Samantha Spades',
          odds: 3.0,
          status: SelectionStatus.WON
        }
      ]
    },
    
    // Current open bets
    {
      id: uuidv4(),
      customerId: claireId,
      customerName: 'Claire Redfield',
      employeeId: '2', // The manager user
      createdAt: new Date(Date.now() - 43200000), // 12 hours ago
      updatedAt: new Date(Date.now() - 43200000),
      status: BetStatus.OPEN,
      type: BetType.SINGLE,
      wagerAmount: 1500,
      potentialPayout: 4800,
      selections: [
        {
          id: uuidv4(),
          eventId: events[0].id,
          eventName: events[0].name,
          selectionName: 'Eddie Marshall',
          odds: 3.2,
          status: SelectionStatus.PENDING
        }
      ]
    },
    {
      id: uuidv4(),
      customerId: maxId,
      customerName: 'Max Payne',
      employeeId: '3',
      createdAt: new Date(Date.now() - 21600000), // 6 hours ago
      updatedAt: new Date(Date.now() - 21600000),
      status: BetStatus.OPEN,
      type: BetType.PARLAY,
      wagerAmount: 2000,
      potentialPayout: 8100,
      selections: [
        {
          id: uuidv4(),
          eventId: events[1].id,
          eventName: events[1].name,
          selectionName: 'Mike "Iron" Tyrone',
          odds: 1.5,
          status: SelectionStatus.PENDING
        },
        {
          id: uuidv4(),
          eventId: events[2].id,
          eventName: events[2].name,
          selectionName: 'Samantha Spades',
          odds: 2.7,
          status: SelectionStatus.PENDING
        }
      ]
    },
    {
      id: uuidv4(),
      customerId: laraId,
      customerName: 'Lara Croft',
      employeeId: '2',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: BetStatus.OPEN,
      type: BetType.SINGLE,
      wagerAmount: 2500,
      potentialPayout: 5500,
      selections: [
        {
          id: uuidv4(),
          eventId: events[0].id,
          eventName: events[0].name,
          selectionName: 'May Maple',
          odds: 2.2,
          status: SelectionStatus.PENDING
        }
      ]
    }
  ];
  
  return { events, customers, bets };
};

const mockData = createMockData();

export const useBetStore = create<BetState>((set, get) => ({
  bets: mockData.bets,
  events: mockData.events,
  customers: mockData.customers,
  activeBet: null,
  isLoading: false,
  
  createBet: (betData) => {
    const id = uuidv4();
    const now = new Date();
    
    // Update event volume and selection stats
    const { events } = get();
    const updatedEvents = events.map(event => {
      const betSelections = betData.selections.filter(s => 
        event.selections.some(es => es.id === s.id)
      );
      
      if (betSelections.length === 0) return event;
      
      const newTotalWagered = event.totalWagered + betData.wagerAmount;
      const newSelectionVolume = { ...event.selectionVolume };
      
      betSelections.forEach(selection => {
        const currentVolume = newSelectionVolume[selection.id] || 0;
        newSelectionVolume[selection.id] = currentVolume + betData.wagerAmount;
      });
      
      return updateEventOdds({
        ...event,
        totalWagered: newTotalWagered,
        selectionVolume: newSelectionVolume
      });
    });
    
    // Deduct wager from customer balance
    get().updateCustomerBalance(betData.customerId, -betData.wagerAmount);
    
    const newBet: Bet = {
      id,
      ...betData,
      createdAt: now,
      updatedAt: now
    };
    
    set(state => ({ 
      bets: [...state.bets, newBet],
      activeBet: newBet,
      events: updatedEvents
    }));
    
    toast.success('Bet created successfully');
    return id;
  },
  
  updateBet: (id, updates) => {
    set(state => ({
      bets: state.bets.map(bet => 
        bet.id === id ? { ...bet, ...updates, updatedAt: new Date() } : bet
      ),
      activeBet: state.activeBet?.id === id 
        ? { ...state.activeBet, ...updates, updatedAt: new Date() } 
        : state.activeBet
    }));
    
    toast.success('Bet updated successfully');
  },
  
  updateBetSelection: (betId, selectionId, status) => {
    set(state => ({
      bets: state.bets.map(bet => {
        if (bet.id !== betId) return bet;
        
        const updatedSelections = bet.selections.map(selection => 
          selection.id === selectionId ? { ...selection, status } : selection
        );
        
        return {
          ...bet,
          selections: updatedSelections,
          updatedAt: new Date()
        };
      }),
      activeBet: state.activeBet?.id === betId 
        ? {
            ...state.activeBet,
            selections: state.activeBet.selections.map(selection => 
              selection.id === selectionId ? { ...selection, status } : selection
            ),
            updatedAt: new Date()
          } 
        : state.activeBet
    }));
  },
  
  settleBet: (id, status, creditToBalance = false) => {
    const { bets, customers } = get();
    const bet = bets.find(b => b.id === id);
    
    if (!bet) {
      toast.error('Bet not found');
      return;
    }
    
    // Update bet status
    set(state => ({
      bets: state.bets.map(bet => 
        bet.id === id 
          ? { ...bet, status, updatedAt: new Date() } 
          : bet
      )
    }));
    
    // Update customer stats and balance
    if (status === BetStatus.WON || status === BetStatus.LOST) {
      const winAmount = status === BetStatus.WON ? bet.potentialPayout : 0;
      get().updateCustomerStats(bet.customerId, bet.wagerAmount, winAmount);
      
      // Credit winnings to balance if requested
      if (creditToBalance && status === BetStatus.WON) {
        get().updateCustomerBalance(bet.customerId, winAmount);
        toast.success(`Credited ${winAmount} to customer balance`);
      }
    }
    
    toast.success(`Bet marked as ${status.toLowerCase()}`);
  },
  
  deleteBet: (id) => {
    set(state => ({
      bets: state.bets.filter(bet => bet.id !== id),
      activeBet: state.activeBet?.id === id ? null : state.activeBet
    }));
    
    toast.success('Bet deleted successfully');
  },
  
  createEvent: (eventData) => {
    const id = uuidv4();
    
    const newEvent: Event = {
      id,
      ...eventData,
      totalWagered: 0,
      selectionVolume: {},
      lastOddsUpdate: new Date(),
      selections: eventData.selections.map(s => ({
        ...s,
        initialOdds: s.odds,
        volume: 0
      }))
    };
    
    set(state => ({ events: [...state.events, newEvent] }));
    toast.success('Event created successfully');
    return id;
  },
  
  updateEvent: (id, updates) => {
    set(state => ({
      events: state.events.map(event => 
        event.id === id ? { ...event, ...updates } : event
      )
    }));
    
    toast.success('Event updated successfully');
  },
  
  updateEventSelection: (eventId, selectionId, updates) => {
    set(state => ({
      events: state.events.map(event => {
        if (event.id !== eventId) return event;
        
        return {
          ...event,
          selections: event.selections.map(selection => 
            selection.id === selectionId ? { ...selection, ...updates } : selection
          )
        };
      })
    }));
  },
  
  deleteEvent: (id) => {
    set(state => ({
      events: state.events.filter(event => event.id !== id)
    }));
    
    toast.success('Event deleted successfully');
  },
  
  createCustomer: (name) => {
    const id = uuidv4();
    
    const newCustomer: Customer = {
      id,
      name,
      totalBets: 0,
      totalWagered: 0,
      totalWon: 0,
      netProfit: 0,
      balance: 0
    };
    
    set(state => ({ customers: [...state.customers, newCustomer] }));
    toast.success('Customer added successfully');
    return id;
  },
  
  updateCustomerStats: (id, betAmount, winAmount) => {
    set(state => ({
      customers: state.customers.map(customer => {
        if (customer.id !== id) return customer;
        
        const totalBets = customer.totalBets + 1;
        const totalWagered = customer.totalWagered + betAmount;
        const totalWon = customer.totalWon + winAmount;
        const netProfit = totalWon - totalWagered;
        
        return {
          ...customer,
          totalBets,
          totalWagered,
          totalWon,
          netProfit,
          lastBet: new Date()
        };
      })
    }));
  },
  
  updateCustomerBalance: (id, amount) => {
    set(state => ({
      customers: state.customers.map(customer => {
        if (customer.id !== id) return customer;
        
        return {
          ...customer,
          balance: customer.balance + amount
        };
      })
    }));
  },
  
  getCustomerBalance: (id) => {
    const customer = get().customers.find(c => c.id === id);
    return customer?.balance || 0;
  },
  
  calculatePotentialPayout: (wagerAmount, selections, betType) => {
    if (!selections.length) return 0;
    
    const wager = new Decimal(wagerAmount);
    
    if (betType === BetType.SINGLE) {
      // For single bets, just multiply wager by odds
      const odds = new Decimal(selections[0].odds);
      return wager.times(odds).toDecimalPlaces(2).toNumber();
    } else {
      // For parlays, multiply all odds together
      const totalOdds = selections.reduce(
        (acc, selection) => acc.times(selection.odds), 
        new Decimal(1)
      );
      return wager.times(totalOdds).toDecimalPlaces(2).toNumber();
    }
  }
}));