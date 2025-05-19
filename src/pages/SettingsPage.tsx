import { useState } from 'react';
import { Save, ChevronDown, PlusCircle, X, Info } from 'lucide-react';
import { useBetStore } from '../stores/betStore';
import { Event, EventStatus, EventSelection } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SettingsPage: React.FC = () => {
  const { events, createEvent, updateEvent, updateEventSelection, deleteEvent } = useBetStore();
  
  // For creating/editing events
  const [newEvent, setNewEvent] = useState<{
    name: string;
    category: string;
    selections: Array<{
      name: string;
      odds: string;
    }>;
  }>({
    name: '',
    category: '',
    selections: [{ name: '', odds: '' }]
  });
  
  const [activeSection, setActiveSection] = useState<'events' | 'account' | 'general'>('events');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  
  // Reset new event form
  const resetEventForm = () => {
    setNewEvent({
      name: '',
      category: '',
      selections: [{ name: '', odds: '' }]
    });
    setEditEventId(null);
  };
  
  // Handle add selection to new event form
  const handleAddSelection = () => {
    setNewEvent({
      ...newEvent,
      selections: [...newEvent.selections, { name: '', odds: '' }]
    });
  };
  
  // Handle remove selection from new event form
  const handleRemoveSelection = (index: number) => {
    const newSelections = [...newEvent.selections];
    newSelections.splice(index, 1);
    setNewEvent({
      ...newEvent,
      selections: newSelections
    });
  };
  
  // Handle selection change
  const handleSelectionChange = (
    index: number,
    field: 'name' | 'odds',
    value: string
  ) => {
    const newSelections = [...newEvent.selections];
    newSelections[index][field] = value;
    setNewEvent({
      ...newEvent,
      selections: newSelections
    });
  };
  
  // Handle create/edit event
  const handleSaveEvent = () => {
    if (!newEvent.name || !newEvent.category || newEvent.selections.some(s => !s.name || !s.odds)) {
      alert('Please fill in all fields');
      return;
    }
    
    // Validate odds
    if (newEvent.selections.some(s => {
      const odds = parseFloat(s.odds);
      return isNaN(odds) || odds <= 0;
    })) {
      alert('Odds must be positive numbers');
      return;
    }
    
    // Create selections for the event
    const selections: EventSelection[] = newEvent.selections.map(s => ({
      id: uuidv4(),
      name: s.name,
      odds: parseFloat(s.odds),
      status: SelectionStatus.PENDING
    }));
    
    if (editEventId) {
      // Update existing event
      updateEvent(editEventId, {
        name: newEvent.name,
        category: newEvent.category,
        selections
      });
    } else {
      // Create new event
      createEvent({
        name: newEvent.name,
        category: newEvent.category,
        status: EventStatus.UPCOMING,
        selections
      });
    }
    
    setShowEventModal(false);
    resetEventForm();
  };
  
  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setEditEventId(event.id);
    setNewEvent({
      name: event.name,
      category: event.category,
      selections: event.selections.map(s => ({
        name: s.name,
        odds: s.odds.toString()
      }))
    });
    setShowEventModal(true);
  };
  
  // Handle delete event
  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteEvent(id);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="card">
            <ul className="space-y-1">
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeSection === 'events'
                      ? 'bg-gray-800 text-primary'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                  onClick={() => setActiveSection('events')}
                >
                  Events
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeSection === 'account'
                      ? 'bg-gray-800 text-primary'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                  onClick={() => setActiveSection('account')}
                >
                  Account
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeSection === 'general'
                      ? 'bg-gray-800 text-primary'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                  onClick={() => setActiveSection('general')}
                >
                  General
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-span-3">
          {activeSection === 'events' && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Betting Events</h3>
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={() => {
                    resetEventForm();
                    setShowEventModal(true);
                  }}
                >
                  <PlusCircle size={18} />
                  <span>New Event</span>
                </button>
              </div>
              
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No events found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border border-gray-700/50 rounded-lg overflow-hidden">
                      <div className="bg-gray-800/70 p-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{event.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge badge-info text-xs">{event.category}</span>
                            <span className="badge badge-warning text-xs">{event.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="text-primary hover:text-primary-hover"
                            onClick={() => handleEditEvent(event)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h5 className="text-sm text-gray-400 mb-2">Selections:</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {event.selections.map((selection) => (
                            <div
                              key={selection.id}
                              className="bg-gray-800/30 p-2 rounded-lg border border-gray-700/50"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-white">{selection.name}</span>
                                <span className="text-primary font-semibold">{selection.odds}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'account' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Change Password</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="label">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        className="input"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="label">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        className="input"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="input"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div>
                      <button className="btn-primary">Change Password</button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-medium mb-2">Profile Information</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="label">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          className="input"
                          placeholder="First Name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="label">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          className="input"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="label">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="input"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <button className="btn-primary">Save Changes</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'general' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Notification Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div>
                        <p className="text-white">Email Notifications</p>
                        <p className="text-sm text-gray-400">Receive notifications via email</p>
                      </div>
                      <div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div>
                        <p className="text-white">Bet Alerts</p>
                        <p className="text-sm text-gray-400">Receive alerts for new bets</p>
                      </div>
                      <div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-medium mb-2">Application Theme</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-primary cursor-pointer">
                      <input type="radio" name="theme" value="dark" checked className="text-primary" />
                      <div>
                        <p className="text-white">Dark Theme</p>
                        <p className="text-sm text-gray-400">Default dark theme</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer">
                      <input type="radio" name="theme" value="light" className="text-primary" />
                      <div>
                        <p className="text-white">Light Theme</p>
                        <p className="text-sm text-gray-400">Bright and light theme</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6 flex justify-end">
                  <button className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    <span>Save All Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {editEventId ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowEventModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="eventName" className="label">Event Name</label>
                  <input
                    type="text"
                    id="eventName"
                    className="input"
                    placeholder="Enter event name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="eventCategory" className="label">Category</label>
                  <select
                    id="eventCategory"
                    className="input"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="Racing">Racing</option>
                    <option value="Fighting">Fighting</option>
                    <option value="Casino">Casino</option>
                    <option value="Sports">Sports</option>
                    <option value="Special">Special</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="label">Selections</label>
                    <button
                      type="button"
                      className="text-sm text-primary hover:text-primary-hover"
                      onClick={handleAddSelection}
                    >
                      + Add Selection
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {newEvent.selections.map((selection, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="flex-1">
                          <input
                            type="text"
                            className="input"
                            placeholder="Selection name"
                            value={selection.name}
                            onChange={(e) => handleSelectionChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            className="input"
                            placeholder="Odds"
                            step="0.1"
                            min="1.0"
                            value={selection.odds}
                            onChange={(e) => handleSelectionChange(index, 'odds', e.target.value)}
                          />
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleRemoveSelection(index)}
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 flex items-start gap-2 text-sm text-gray-400">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <p>
                      For each event, add at least one selection with odds. For example, in a race, each participant would be a selection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowEventModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveEvent}
              >
                {editEventId ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Import required for settings page
import { SelectionStatus } from '../types';

export default SettingsPage;