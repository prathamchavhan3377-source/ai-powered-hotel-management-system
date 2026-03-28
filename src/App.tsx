/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Customers from './pages/Customers';
import Bookings from './pages/Bookings';
import Billing from './pages/Billing';
import AIRecommendation from './pages/AIRecommendation';
import GuestBooking from './pages/GuestBooking';
import Auth from './components/Auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={user ? <Layout user={user} role={role} /> : <Navigate to="/auth" />}
        >
          <Route index element={role === 'guest' ? <GuestBooking /> : <Dashboard />} />
          <Route path="rooms" element={role === 'guest' ? <Navigate to="/" /> : <Rooms />} />
          <Route path="customers" element={role === 'guest' ? <Navigate to="/" /> : <Customers />} />
          <Route path="bookings" element={role === 'guest' ? <Navigate to="/" /> : <Bookings />} />
          <Route path="billing" element={role === 'guest' ? <Navigate to="/" /> : <Billing />} />
          <Route path="ai-recommend" element={<AIRecommendation />} />
          <Route path="my-bookings" element={role === 'guest' ? <GuestBooking /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}
