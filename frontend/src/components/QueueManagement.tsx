"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface QueueItem {
  id: number;
  queueNumber: number;
  patient: Patient;
  patientId: number;
  status: 'waiting' | 'with_doctor' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reason?: string;
  notes?: string;
  createdAt: string;
}

export default function QueueManagement() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [priority, setPriority] = useState('normal');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queue/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setQueue(data);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchPatients();
  }, []);

  const addToQueue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const patient = patients.find(p => p.id.toString() === selectedPatient);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: parseInt(selectedPatient),
          priority,
          reason,
        }),
      });

      if (response.ok) {
        setSelectedPatient('');
        setPriority('normal');
        setReason('');
        fetchQueue();
        toast.success(`${patientName} added to queue successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add to queue: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast.error(`Failed to add ${patientName} to queue: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateQueueStatus = async (id: number, status: string) => {
    const queueItem = queue.find(q => q.id === id);
    const patientName = queueItem ? `${queueItem.patient.firstName} ${queueItem.patient.lastName}` : 'Patient';

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queue/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchQueue();
        toast.success(`${patientName} status updated to ${status.replace('_', ' ')}!`);
      } else {
        toast.error('Failed to update queue status');
      }
    } catch (error) {
      console.error('Error updating queue status:', error);
      toast.error(`Failed to update status for ${patientName}: ${(error as Error).message}`);
    }
  };

  const callNext = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queue/call-next`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        fetchQueue();
        if (result && result.patient) {
          toast.success(`${result.patient.firstName} ${result.patient.lastName} called to see doctor!`);
        } else {
          toast.success('Next patient called successfully!');
        }
      } else {
        toast.error('No patients waiting in queue');
      }
    } catch (error) {
      console.error('Error calling next patient:', error);
      toast.error(`Failed to call next patient: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Queue Management</h1>
        <button
          onClick={callNext}
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
        >
          Call Next Patient
        </button>
      </div>

      {/* Add to Queue Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Patient to Queue</h2>
        <form onSubmit={addToQueue} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              placeholder="Visit reason"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add to Queue'}
            </button>
          </div>
        </form>
      </div>

      {/* Current Queue */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Current Queue</h3>
          {queue.length > 0 ? (
            <div className="space-y-4">
              {queue.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 text-white text-lg font-semibold">
                          {item.queueNumber}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.patient.firstName} {item.patient.lastName}
                        </h4>
                        <p className="text-sm text-gray-900">{item.reason || 'General consultation'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.priority}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'with_doctor' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {item.status === 'waiting' && (
                        <button
                          onClick={() => updateQueueStatus(item.id, 'with_doctor')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Call Patient
                        </button>
                      )}
                      {item.status === 'with_doctor' && (
                        <button
                          onClick={() => updateQueueStatus(item.id, 'completed')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Mark Complete
                        </button>
                      )}
                      <button
                        onClick={() => updateQueueStatus(item.id, 'cancelled')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-900 text-center py-8">No patients in queue</p>
          )}
        </div>
      </div>
    </div>
  );
}
