import { create } from 'zustand';
import { toast } from 'react-toastify';
import { User, UserRole, AuthState } from '../types';

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@blarneys.com',
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    createdAt: new Date('2023-01-01'),
    betsProcessed: 156,
    totalBetAmount: 78500,
    uniqueCustomers: 45
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    email: 'manager@blarneys.com',
    role: UserRole.MANAGER,
    firstName: 'Manager',
    lastName: 'User',
    createdAt: new Date('2023-01-15'),
    betsProcessed: 234,
    totalBetAmount: 156000,
    uniqueCustomers: 72
  },
  {
    id: '3',
    username: 'employee',
    password: 'employee123',
    email: 'employee@blarneys.com',
    role: UserRole.EMPLOYEE,
    firstName: 'Employee',
    lastName: 'User',
    createdAt: new Date('2023-02-01'),
    betsProcessed: 189,
    totalBetAmount: 94500,
    uniqueCustomers: 58
  }
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (username: string, password: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );
      
      if (!user) {
        throw new Error('Invalid username or password');
      }
      
      // Remove password before storing user
      const { password: _, ...userWithoutPassword } = user;
      const authenticatedUser: User = {
        ...userWithoutPassword,
        lastLogin: new Date()
      };
      
      // Store auth in localStorage (for demo)
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      set({ 
        user: authenticatedUser, 
        isAuthenticated: true,
        isLoading: false 
      });
      
      toast.success(`Welcome back, ${user.firstName || user.username}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    set({ user: null, isAuthenticated: false });
    toast.info('You have been logged out');
  },
  
  checkAuth: () => {
    const userJson = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (userJson && isAuthenticated) {
      try {
        const user = JSON.parse(userJson) as User;
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));