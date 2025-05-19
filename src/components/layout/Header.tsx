import { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Menu, X, Lock as Shamrock, LayoutDashboard, TicketCheck, ListChecks, BarChart4, Users, Settings, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/betting':
        return 'Create Bet';
      case '/manage':
        return 'Manage Bets';
      case '/reports':
        return 'Reports';
      case '/employees':
        return 'Employees';
      case '/settings':
        return 'Settings';
      default:
        return 'Blarneys Sportsbook';
    }
  };
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-gray-800 text-primary' 
        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
    }`;
  
  return (
    <header className="bg-gray-900/80 border-b border-gray-800 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Page title */}
        <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
        
        {/* Right side */}
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white">
            <Bell size={20} />
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="font-semibold text-sm text-white">
                {user?.firstName?.charAt(0) || user?.username.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-white">
              {user?.firstName || user?.username}
            </span>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Shamrock className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-lg font-bold text-white">Blarneys</h1>
                <p className="text-xs text-primary">Sportsbook</p>
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <NavLink 
              to="/dashboard" 
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/betting" 
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <TicketCheck size={20} />
              <span>Create Bet</span>
            </NavLink>
            
            <NavLink 
              to="/manage" 
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ListChecks size={20} />
              <span>Manage Bets</span>
            </NavLink>
            
            <NavLink 
              to="/reports" 
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BarChart4 size={20} />
              <span>Reports</span>
            </NavLink>
            
            {user?.role === UserRole.ADMIN && (
              <NavLink 
                to="/employees" 
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users size={20} />
                <span>Employees</span>
              </NavLink>
            )}
            
            <NavLink 
              to="/settings" 
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </nav>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="font-semibold text-white">
                  {user?.firstName?.charAt(0) || user?.username.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">
                  {user?.firstName || user?.username}
                </p>
                <p className="text-sm text-gray-400">{user?.role}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;