import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  CalendarCheck, 
  Receipt, 
  Sparkles, 
  LogOut,
  Hotel
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  user: User;
  role: string | null;
}

export default function Layout({ user, role }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { name: 'Rooms', path: '/rooms', icon: BedDouble, roles: ['admin', 'staff'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['admin', 'staff'] },
    { name: 'Bookings', path: '/bookings', icon: CalendarCheck, roles: ['admin', 'staff'] },
    { name: 'Billing', path: '/billing', icon: Receipt, roles: ['admin', 'staff'] },
    { name: 'AI Recommend', path: '/ai-recommend', icon: Sparkles, roles: ['admin', 'staff', 'guest'] },
    { name: 'My Bookings', path: '/my-bookings', icon: CalendarCheck, roles: ['guest'] },
  ];

  const filteredMenuItems = menuItems.filter(item => !role || item.roles.includes(role));

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Hotel className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">HotelIQ</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-slate-500 capitalize">{role || 'Staff'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
