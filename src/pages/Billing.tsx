import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Receipt, 
  Search, 
  Download, 
  Printer, 
  Mail, 
  ChevronRight,
  Hotel,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Booking {
  id: string;
  roomId: string;
  customerId: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
}

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function Billing() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    });
    const unsubRooms = onSnapshot(collection(db, 'rooms'), (snapshot) => {
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

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getRoom = (id: string) => rooms.find(r => r.id === id);

  const filteredBookings = bookings.filter(b => {
    const customer = getCustomer(b.customerId);
    return customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           b.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Invoices</h1>
        <p className="text-slate-500 font-medium mt-1">Generate and manage guest invoices</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by guest or invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredBookings.map((booking) => {
              const customer = getCustomer(booking.customerId);
              const isSelected = selectedBooking?.id === booking.id;
              return (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={cn(
                    "w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-all text-left",
                    isSelected ? "bg-blue-50/50 border-l-4 border-l-blue-600" : ""
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{customer?.name || 'Unknown Guest'}</p>
                    <p className="text-xs text-slate-500 font-medium">Inv: #{booking.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">${booking.totalAmount.toFixed(2)}</p>
                    <div className="flex items-center justify-end gap-1">
                      {booking.status === 'Checked-Out' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-500" />
                      )}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.status}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-2" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="lg:col-span-2">
          {selectedBooking ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 p-2 rounded-xl text-white">
                    <Hotel className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">HotelIQ</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Invoice</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <Mail className="w-5 h-5" />
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="p-12 space-y-12">
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Bill To</p>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{getCustomer(selectedBooking.customerId)?.name}</h3>
                    <div className="space-y-1 text-sm text-slate-500 font-medium">
                      <p>{getCustomer(selectedBooking.customerId)?.email}</p>
                      <p>{getCustomer(selectedBooking.customerId)?.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Invoice Details</p>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">Invoice ID: <span className="text-slate-500 font-medium">#{selectedBooking.id.toUpperCase()}</span></p>
                      <p className="text-sm font-bold text-slate-900">Date: <span className="text-slate-500 font-medium">{format(new Date(), 'MMMM d, yyyy')}</span></p>
                      <p className="text-sm font-bold text-slate-900">Status: <span className="text-emerald-600 font-bold uppercase tracking-widest">{selectedBooking.status}</span></p>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-6 py-6">
                          <p className="font-bold text-slate-900">Room {getRoom(selectedBooking.roomId)?.roomNumber} - {getRoom(selectedBooking.roomId)?.type}</p>
                          <p className="text-xs text-slate-500 font-medium mt-1">Standard night rate: ${getRoom(selectedBooking.roomId)?.price}/night</p>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm font-medium text-slate-600">
                            {format(parseISO(selectedBooking.checkIn), 'MMM d')} - {format(parseISO(selectedBooking.checkOut), 'MMM d, yyyy')}
                          </p>
                        </td>
                        <td className="px-6 py-6 text-right font-black text-slate-900">
                          ${selectedBooking.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-4">
                    <div className="flex justify-between text-sm font-medium text-slate-500">
                      <span>Subtotal</span>
                      <span>${selectedBooking.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-slate-500">
                      <span>Tax (0%)</span>
                      <span>$0.00</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                      <span className="text-lg font-bold text-slate-900">Total Amount</span>
                      <span className="text-3xl font-black text-blue-600">${selectedBooking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 text-center border-t border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Thank you for choosing HotelIQ</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Receipt className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Invoice Selected</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Select a booking from the list on the left to generate and view the invoice details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
