import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Plus, 
  Calendar, 
  Bed, 
  User, 
  Check, 
  X, 
  Clock,
  AlertCircle,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  price: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  roomId: string;
  customerId: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'Confirmed' | 'Checked-In' | 'Checked-Out' | 'Cancelled';
  createdAt: string;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    roomId: '',
    customerId: '',
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    });

    const unsubRooms = onSnapshot(query(collection(db, 'rooms'), where('status', '==', 'Available')), (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    });

    return () => {
      unsubBookings();
      unsubRooms();
      unsubCustomers();
    };
  }, []);

  const calculateTotal = (roomId: string, checkIn: string, checkOut: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    const days = differenceInDays(parseISO(checkOut), parseISO(checkIn));
    return Math.max(1, days) * room.price;
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Double booking check (simplified for demo, usually done on server)
      const q = query(
        collection(db, 'bookings'), 
        where('roomId', '==', formData.roomId),
        where('status', 'in', ['Confirmed', 'Checked-In'])
      );
      const existing = await getDocs(q);
      
      // Basic overlap check
      const isOverlap = existing.docs.some(doc => {
        const b = doc.data();
        return (formData.checkIn < b.checkOut && formData.checkOut > b.checkIn);
      });

      if (isOverlap) {
        alert('This room is already booked for the selected dates.');
        setLoading(false);
        return;
      }

      const totalAmount = calculateTotal(formData.roomId, formData.checkIn, formData.checkOut);

      // 2. Create booking
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        totalAmount,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      });

      // 3. Update room status
      await updateDoc(doc(db, 'rooms', formData.roomId), {
        status: 'Occupied'
      });

      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (booking: Booking, newStatus: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { status: newStatus });
      
      if (newStatus === 'Checked-Out' || newStatus === 'Cancelled') {
        await updateDoc(doc(db, 'rooms', booking.roomId), { status: 'Available' });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
    }
  };

  const getRoomNumber = (id: string) => bookings.find(b => b.roomId === id)?.roomId || 'N/A';
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown Guest';

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reservations</h1>
          <p className="text-slate-500 font-medium mt-1">Manage check-ins, check-outs and bookings</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-5 h-5" />
          New Reservation
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {bookings.map((booking) => {
          const room = rooms.find(r => r.id === booking.roomId);
          return (
            <div key={booking.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Bed className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room</p>
                    <p className="text-xl font-black text-slate-900">
                      {rooms.find(r => r.id === booking.roomId)?.roomNumber || 'Room'}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Guest Details</p>
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <User className="w-4 h-4 text-blue-600" />
                    {getCustomerName(booking.customerId)}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                    <p className="text-sm font-bold text-slate-900">{format(parseISO(booking.checkIn), 'MMM d, yyyy')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check Out</p>
                    <p className="text-sm font-bold text-slate-900">{format(parseISO(booking.checkOut), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="min-w-[120px] text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-xl font-black text-slate-900">${booking.totalAmount.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest",
                    booking.status === 'Confirmed' ? "bg-blue-50 text-blue-600" :
                    booking.status === 'Checked-In' ? "bg-emerald-50 text-emerald-600" :
                    booking.status === 'Checked-Out' ? "bg-slate-50 text-slate-500" : "bg-red-50 text-red-600"
                  )}>
                    {booking.status}
                  </div>
                  
                  <div className="flex gap-2">
                    {booking.status === 'Confirmed' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking, 'Checked-In')}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                        title="Check In"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    {booking.status === 'Checked-In' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking, 'Checked-Out')}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                        title="Check Out"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                    )}
                    {['Confirmed', 'Checked-In'].includes(booking.status) && (
                      <button 
                        onClick={() => handleStatusUpdate(booking, 'Cancelled')}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">New Reservation</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Select Room</label>
                <div className="relative">
                  <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Select an available room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.roomNumber} - {room.type} (${room.price}/night)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Select Guest</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Select a customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Check In</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      required
                      min={format(new Date(), 'yyyy-MM-dd')}
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Check Out</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      required
                      min={formData.checkIn}
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {formData.roomId && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-bold text-blue-900">Estimated Total</p>
                  </div>
                  <p className="text-xl font-black text-blue-900">
                    ${calculateTotal(formData.roomId, formData.checkIn, formData.checkOut).toFixed(2)}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formData.roomId || !formData.customerId}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirm Reservation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
