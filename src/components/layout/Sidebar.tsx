import { NavLink } from 'react-router-dom';
import { 
  Lock as Shamrock, 
  LayoutDashboard, 
  TicketCheck, 
  ListChecks, 
  BarChart4, 
  Users, 
  Settings, 
  LogOut,
  UserSquare2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-gray-800 text-primary' 
        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
    }`;
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-900/80 border-r border-gray-800">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Shamrock className="h-8 w-8 text-primary logo-animate" />
          <div>
            <h1 className="text-xl font-bold text-white">Blarneys</h1>
            <p className="text-xs text-primary">Sportsbook</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/betting" className={navLinkClass}>
          <TicketCheck size={20} />
          <span>Create Bet</span>
        </NavLink>
        
        <NavLink to="/manage" className={navLinkClass}>
          <ListChecks size={20} />
          <span>Manage Bets</span>
        </NavLink>
        
        <NavLink to="/customers" className={navLinkClass}>
          <UserSquare2 size={20} />
          <span>Customers</span>
        </NavLink>
        
        <NavLink to="/reports" className={navLinkClass}>
          <BarChart4 size={20} />
          <span>Reports</span>
        </NavLink>
        
        {user?.role === UserRole.ADMIN && (
          <NavLink to="/employees" className={navLinkClass}>
            <Users size={20} />
            <span>Employees</span>
          </NavLink>
        )}
        
        <NavLink to="/settings" className={navLinkClass}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="font-semibold text-sm text-white">
              {user?.firstName?.charAt(0) || user?.username.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {user?.firstName || user?.username}
            </p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;