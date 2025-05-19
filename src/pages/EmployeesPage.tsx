import { useState } from 'react';
import { 
  UserPlus, 
  Edit, 
  Trash, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  X,
  BarChart3,
  Star,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { User, UserRole } from '../types';
import { formatDate } from '../utils/dateUtils';
import PerformanceMetrics from '../components/employees/PerformanceMetrics';

const MOCK_EMPLOYEES: User[] = [
  {
    id: '1',
    username: 'admin',
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    createdAt: new Date('2023-01-01'),
    lastLogin: new Date(),
    betsProcessed: 156,
    payoutAccuracy: 99.2,
    customerRating: 4.8
  },
  {
    id: '2',
    username: 'manager',
    role: UserRole.MANAGER,
    firstName: 'Manager',
    lastName: 'User',
    createdAt: new Date('2023-01-15'),
    lastLogin: new Date(Date.now() - 86400000),
    betsProcessed: 234,
    payoutAccuracy: 98.7,
    customerRating: 4.6
  },
  {
    id: '3',
    username: 'employee',
    role: UserRole.EMPLOYEE,
    firstName: 'Employee',
    lastName: 'User',
    createdAt: new Date('2023-02-01'),
    lastLogin: new Date(Date.now() - 172800000),
    betsProcessed: 189,
    payoutAccuracy: 97.5,
    customerRating: 4.4
  },
  {
    id: '4',
    username: 'cashier1',
    role: UserRole.EMPLOYEE,
    firstName: 'Alice',
    lastName: 'Johnson',
    createdAt: new Date('2023-03-15'),
    lastLogin: new Date(Date.now() - 259200000),
    betsProcessed: 167,
    payoutAccuracy: 96.8,
    customerRating: 4.7
  }
];

const EmployeesPage: React.FC = () => {
  const { user } = useAuthStore();
  
  const [employees, setEmployees] = useState<User[]>(MOCK_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const averages = {
    betsProcessed: Math.round(
      employees.reduce((sum, emp) => sum + emp.betsProcessed, 0) / employees.length
    ),
    totalBetAmount: Math.round(
      employees.reduce((sum, emp) => sum + emp.totalBetAmount, 0) / employees.length
    ),
    uniqueCustomers: Math.round(
      employees.reduce((sum, emp) => sum + emp.uniqueCustomers, 0) / employees.length
    )
  };
  
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    role: UserRole.EMPLOYEE,
    password: ''
  });
  
  const resetForm = () => {
    setFormData({
      username: '',
      firstName: '',
      lastName: '',
      role: UserRole.EMPLOYEE,
      password: ''
    });
  };
  
  const handleEditClick = (employee: User) => {
    setSelectedEmployee(employee);
    setFormData({
      username: employee.username,
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      role: employee.role,
      password: ''
    });
    setShowEditModal(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEmployee: User = {
      id: (employees.length + 1).toString(),
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role as UserRole,
      createdAt: new Date(),
      betsProcessed: 0,
      payoutAccuracy: 100,
      customerRating: 5
    };
    
    setEmployees([...employees, newEmployee]);
    setShowAddModal(false);
    resetForm();
  };
  
  const handleEditEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) return;
    
    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id
        ? {
            ...emp,
            username: formData.username,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role as UserRole
          }
        : emp
    );
    
    setEmployees(updatedEmployees);
    setShowEditModal(false);
    setSelectedEmployee(null);
    resetForm();
  };
  
  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Employees</h2>
        <button 
          className="btn-primary flex items-center gap-2"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <UserPlus size={18} />
          <span>Add Employee</span>
        </button>
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No employees found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {employees.map((employee) => (
                <div key={employee.id} className="border border-gray-700/50 rounded-lg overflow-hidden">
                  <div className="bg-gray-800/70 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400">{employee.email}</span>
                          <span className={`badge ${
                            employee.role === UserRole.ADMIN 
                              ? 'badge-info' 
                              : employee.role === UserRole.MANAGER 
                                  ? 'badge-success' 
                                  : 'badge-warning'
                          }`}>
                            {employee.role}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="text-primary hover:text-primary-hover"
                          onClick={() => handleEditClick(employee)}
                        >
                          <Edit size={16} />
                        </button>
                        {employee.id !== user?.id && (
                          <button
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <PerformanceMetrics 
                      user={employee}
                      averages={averages}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Add New Employee</h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="username" className="label">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                                
                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="label">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.MANAGER}>Manager</option>
                    <option value={UserRole.EMPLOYEE}>Employee</option>
                  </select>
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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Edit Employee</h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditEmployee} className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editFirstName" className="label">First Name</label>
                    <input
                      type="text"
                      id="editFirstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editLastName" className="label">Last Name</label>
                    <input
                      type="text"
                      id="editLastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="editUsername" className="label">Username</label>
                  <input
                    type="text"
                    id="editUsername"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
  
                <div>
                  <label htmlFor="editPassword" className="label">
                    Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    id="editPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="editRole" className="label">Role</label>
                  <select
                    id="editRole"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.MANAGER}>Manager</option>
                    <option value={UserRole.EMPLOYEE}>Employee</option>
                  </select>
                </div>
              </div>
              
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
    </div>
  );
};

export default EmployeesPage;