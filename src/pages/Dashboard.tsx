import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  BedDouble, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalCustomers: 0,
    activeBookings: 0
  });

  useEffect(() => {
    const unsubRooms = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const rooms = snapshot.docs.map(doc => doc.data());
      setStats(prev => ({
        ...prev,
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status === 'Available').length,
        occupiedRooms: rooms.filter(r => r.status === 'Occupied').length
      }));
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setStats(prev => ({ ...prev, totalCustomers: snapshot.size }));
    });

    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setStats(prev => ({ 
        ...prev, 
        activeBookings: snapshot.docs.filter(d => ['Confirmed', 'Checked-In'].includes(d.data().status)).length 
      }));
    });

    return () => {
      unsubRooms();
      unsubCustomers();
      unsubBookings();
    };
  }, []);

  const cards = [
    { 
      title: 'Total Rooms', 
      value: stats.totalRooms, 
      icon: BedDouble, 
      color: 'bg-blue-500', 
      trend: '+2 from last month',
      trendUp: true
    },
    { 
      title: 'Available Rooms', 
      value: stats.availableRooms, 
      icon: CheckCircle2, 
      color: 'bg-emerald-500', 
      trend: 'Ready for check-in',
      trendUp: true
    },
    { 
      title: 'Occupied Rooms', 
      value: stats.occupiedRooms, 
      icon: AlertCircle, 
      color: 'bg-amber-500', 
      trend: 'Currently in use',
      trendUp: false
    },
    { 
      title: 'Active Bookings', 
      value: stats.activeBookings, 
      icon: CalendarCheck, 
      color: 'bg-indigo-500', 
      trend: '+12% this week',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back to HotelIQ Management</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-600">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl text-white shadow-lg", card.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  card.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
                )}>
                  {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trendUp ? 'UP' : 'STABLE'}
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{card.title}</h3>
              <p className="text-4xl font-black text-slate-900 mb-2">{card.value}</p>
              <p className="text-xs text-slate-400 font-medium">{card.trend}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">New Booking: Room 204</p>
                  <p className="text-xs text-slate-500 font-medium">Guest: Alex Johnson • 2 mins ago</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">$450.00</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/40">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI Insights</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Occupancy is expected to increase by 25% this weekend. Consider adjusting pricing for Deluxe suites.
            </p>
            <button className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              View Suggestions
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
