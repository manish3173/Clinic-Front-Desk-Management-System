import { HomeIcon, UserGroupIcon, CalendarIcon, UserIcon, QueueListIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

const navigation = [
  { name: 'Dashboard', id: 'dashboard', icon: HomeIcon },
  { name: 'Queue Management', id: 'queue', icon: QueueListIcon },
  { name: 'Appointments', id: 'appointments', icon: CalendarIcon },
  { name: 'Doctors', id: 'doctors', icon: UserGroupIcon },
  { name: 'Patients', id: 'patients', icon: UserIcon },
];

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-white font-bold text-lg">Clinic System</span>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-800">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 ${
                    isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </button>
            );
          })}
        </nav>
        
        <div className="flex-shrink-0 flex bg-gray-700 p-4">
          <div className="flex-shrink-0 group block">
            <div className="flex items-center">
              <div>
                <div className="inline-block h-9 w-9 rounded-full bg-gray-500">
                  <UserIcon className="h-9 w-9 text-white p-2" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user?.fullName}</p>
                <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="ml-3 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
