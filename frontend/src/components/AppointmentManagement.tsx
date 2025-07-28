"use client";

import { useState, useEffect } from 'react';
import { Appointment, Doctor, Patient, apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    type: 'consultation' as Appointment['type'],
    reason: '',
    notes: '',
    isPriority: false
  });

  const appointmentTypes = [
    'consultation', 'follow_up', 'emergency', 'routine_checkup'
  ];

  const statuses = [
    'booked', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, doctorsData, patientsData] = await Promise.all([
        apiClient.getAppointments(),
        apiClient.getDoctors(),
        apiClient.getPatients()
      ]);
      setAppointments(appointmentsData);
      setDoctors(doctorsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load appointment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting appointment data:', formData);
      
      // Validate that the appointment date is not in the past
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      
      if (selectedDate < today) {
        toast.error('Cannot schedule appointments for past dates. Please select a current or future date.');
        return;
      }
      
      const appointmentData = {
        ...formData,
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        status: 'booked' as const
      };

      console.log('Processed appointment data:', appointmentData);

      if (editingAppointment) {
        const result = await apiClient.updateAppointment(editingAppointment.id, appointmentData);
        console.log('Appointment updated:', result);
        toast.success('Appointment updated successfully!');
      } else {
        const result = await apiClient.createAppointment(appointmentData);
        console.log('Appointment created:', result);
        toast.success('Appointment created successfully!');
      }
      
      await loadData();
      setShowAddForm(false);
      setEditingAppointment(null);
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        duration: 30,
        type: 'consultation' as Appointment['type'],
        reason: '',
        notes: '',
        isPriority: false
      });
    } catch (error) {
      console.error('Failed to save appointment:', error);
      toast.error(`Failed to save appointment: ${(error as Error).message}`);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      appointmentDate: appointment.appointmentDate.split('T')[0],
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration,
      type: appointment.type,
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      isPriority: appointment.isPriority
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    const appointment = appointments.find(a => a.id === id);
    const appointmentDetails = appointment ? 
      `appointment for ${appointment.patient.firstName} ${appointment.patient.lastName}` : 
      'this appointment';
    
    if (confirm(`Are you sure you want to delete ${appointmentDetails}?`)) {
      try {
        await apiClient.deleteAppointment(id);
        await loadData();
        toast.success('Appointment deleted successfully!');
      } catch (error) {
        console.error('Failed to delete appointment:', error);
        toast.error(`Failed to delete appointment: ${(error as Error).message}`);
      }
    }
  };

  const handleStatusUpdate = async (id: number, status: Appointment['status']) => {
    try {
      await apiClient.updateAppointmentStatus(id, status);
      await loadData();
      toast.success(`Appointment status updated to ${status.replace('_', ' ')}!`);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      toast.error(`Failed to update appointment status: ${(error as Error).message}`);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.doctor.firstName} ${appointment.doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.reason && appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const todaysAppointments = filteredAppointments.filter(appointment => {
    const today = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    
    // Compare just the date parts (ignoring time)
    return today.getFullYear() === appointmentDate.getFullYear() &&
           today.getMonth() === appointmentDate.getMonth() &&
           today.getDate() === appointmentDate.getDate();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Appointment Management</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by patient, doctor, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Today's Appointments Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Today's Appointments ({todaysAppointments.length})
        </h2>
        {todaysAppointments.length === 0 ? (
          <p className="text-gray-900 text-center py-4">No appointments scheduled for today.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysAppointments.slice(0, 6).map(appointment => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium">
                    {appointment.appointmentTime}
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-900 mb-1">
                  Patient: {appointment.patient.firstName} {appointment.patient.lastName}
                </div>
                <div className="text-sm text-gray-900 mb-1">
                  Doctor: Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                </div>
                <div className="text-xs text-gray-900">
                  {appointment.type.replace('_', ' ')} • {appointment.duration}min
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
              >
                <option value="">Select patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - {patient.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select
                required
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
              >
                <option value="">Select doctor</option>
                {doctors.filter(doctor => doctor.isAvailable).map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Cannot select past dates</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                required
                min="15"
                max="240"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
              >
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Reason for appointment..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Additional notes..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPriority}
                  onChange={(e) => setFormData({ ...formData, isPriority: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Priority Appointment</span>
              </label>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAppointment(null);
                  setFormData({
                    patientId: '',
                    doctorId: '',
                    appointmentDate: '',
                    appointmentTime: '',
                    duration: 30,
                    type: 'consultation' as Appointment['type'],
                    reason: '',
                    notes: '',
                    isPriority: false
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            All Appointments ({filteredAppointments.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-900">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-900">
              {searchTerm || statusFilter !== 'all' ? 'No appointments found matching your filters.' : 'No appointments scheduled yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-900">
                        {appointment.appointmentTime}
                        {appointment.isPriority && (
                          <span className="ml-2 text-xs text-red-600 font-semibold">PRIORITY</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-900">{appointment.patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </div>
                      <div className="text-sm text-gray-900">{appointment.doctor.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {appointment.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-900">{appointment.duration} minutes</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusUpdate(appointment.id, e.target.value as any)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(appointment.status)}`}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
