"use client";

import { useState, useEffect } from 'react';
import { apiClient, QueueStats, QueueItem, Appointment } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [recentQueue, setRecentQueue] = useState<QueueItem[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [queueStats, activeQueue, allAppointments] = await Promise.all([
        apiClient.getQueueStats(),
        apiClient.getActiveQueue(),
        apiClient.getAppointments(),
      ]);

      setStats(queueStats);
      setRecentQueue(activeQueue.slice(0, 5));
      
      // Filter appointments for today
      const today = new Date();
      const todaysAppointments = allAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        
        // Compare just the date parts (ignoring time)
        return today.getFullYear() === appointmentDate.getFullYear() &&
               today.getMonth() === appointmentDate.getMonth() &&
               today.getDate() === appointmentDate.getDate();
      });
      
      setTodayAppointments(todaysAppointments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{stats?.total || 0}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total in Queue</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{stats?.waiting || 0}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Waiting</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.waiting || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{stats?.withDoctor || 0}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">With Doctor</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.withDoctor || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{stats?.averageWaitTime || 0}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Wait (min)</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.averageWaitTime || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Queue */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Current Queue</h3>
            {recentQueue.length > 0 ? (
              <div className="space-y-3">
                {recentQueue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500 text-white text-sm font-medium">
                          {item.queueNumber}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.patient.firstName} {item.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-900">{item.reason || 'General consultation'}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'with_doctor' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-900 text-center py-4">No one in queue</p>
            )}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Today's Appointments</h3>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {appointment.appointmentTime}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-900">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-900 text-center py-4">No appointments today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
