import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Bed, 
  Calendar, 
  Check, 
  Clock, 
  X, 
  AlertCircle,
  ArrowRight,
  History,
  Sparkles
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
  capacity: number;
  status: string;
  description: string;
}

interface Booking {
  id: string;
  roomId: string;
  customerId: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function GuestBooking() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    // Listen for available rooms
    const unsubRooms = onSnapshot(query(collection(db, 'rooms'), where('status', '==', 'Available')), (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));
    });

    // Listen for user's own bookings
    if (auth.currentUser) {
      const unsubBookings = onSnapshot(
        query(
          collection(db, 'bookings'), 
          where('customerId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        ), 
        (snapshot) => {
          setMyBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
        }
      );
      return () => {
        unsubRooms();
        unsubBookings();
      };
    }

    return () => unsubRooms();
  }, []);

  const calculateTotal = (price: number, checkIn: string, checkOut: string) => {
    const days = differenceInDays(parseISO(checkOut), parseISO(checkIn));
    return Math.max(1, days) * price;
  };

  const handleBookRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !auth.currentUser) return;
    setLoading(true);

    try {
      const totalAmount = calculateTotal(selectedRoom.price, formData.checkIn, formData.checkOut);

      // Create booking
      await addDoc(collection(db, 'bookings'), {
        roomId: selectedRoom.id,
        customerId: auth.currentUser.uid,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        totalAmount,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      });

      // Update room status
      await updateDoc(doc(db, 'rooms', selectedRoom.id), {
        status: 'Occupied'
      });

      setIsBookingModalOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Book Your Stay</h1>
        <p className="text-slate-500 font-medium mt-1">Find and reserve the perfect room for your visit</p>
      </header>

      {/* Available Rooms */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Bed className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Available Rooms</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.length > 0 ? rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                    <Bed className="w-6 h-6" />
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Available
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Room {room.roomNumber}</h3>
                <p className="text-slate-500 font-medium text-sm mb-4">{room.type} Suite</p>
                <p className="text-slate-600 text-sm mb-6 line-clamp-2">{room.description || 'A comfortable and well-appointed room for your stay.'}</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</p>
                    <p className="text-xl font-black text-slate-900">${room.price}<span className="text-xs text-slate-400 font-bold">/night</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                    <p className="text-sm font-bold text-slate-900">{room.capacity} Guests</p>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedRoom(room); setIsBookingModalOpen(true); }}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-500 font-medium">No rooms available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* Booking History */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">My Bookings</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {myBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <Bed className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-bold text-slate-900">Room ID: {booking.roomId.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {format(parseISO(booking.checkIn), 'MMM d')} - {format(parseISO(booking.checkOut), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-slate-900">${booking.totalAmount.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={cn(
                          "inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          booking.status === 'Confirmed' ? "bg-blue-50 text-blue-600" :
                          booking.status === 'Checked-In' ? "bg-emerald-50 text-emerald-600" :
                          booking.status === 'Checked-Out' ? "bg-slate-50 text-slate-500" : "bg-red-50 text-red-600"
                        )}>
                          {booking.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium">
              You haven't made any bookings yet.
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Confirm Booking</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Room {selectedRoom.roomNumber}</p>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleBookRoom} className="p-8 space-y-6">
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

              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-600">Price per night</p>
                  <p className="text-sm font-black text-slate-900">${selectedRoom.price}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-600">Duration</p>
                  <p className="text-sm font-black text-slate-900">
                    {differenceInDays(parseISO(formData.checkOut), parseISO(formData.checkIn)) || 1} Nights
                  </p>
                </div>
                <div className="pt-4 border-t border-blue-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <p className="text-base font-black text-blue-900">Total Amount</p>
                  </div>
                  <p className="text-2xl font-black text-blue-900">
                    ${calculateTotal(selectedRoom.price, formData.checkIn, formData.checkOut).toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-900/20"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirm & Pay
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
