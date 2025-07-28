"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import QueueManagement from '@/components/QueueManagement';
import AppointmentManagement from '@/components/AppointmentManagement';
import DoctorManagement from '@/components/DoctorManagement';
import PatientManagement from '@/components/PatientManagement';
import Dashboard from '@/components/Dashboard';
import AuthCheck from '@/components/AuthCheck';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard mounted, checking authentication...');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Token found:', !!token);
    console.log('User data found:', !!userData);
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      console.log('Setting user:', parsedUser);
      setUser(parsedUser);
    } else {
      console.log('No valid auth data, redirecting to login');
    }
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'queue':
        return <QueueManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'doctors':
        return <DoctorManagement />;
      case 'patients':
        return <PatientManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthCheck>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}
