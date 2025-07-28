const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  gender: string;
  location: string;
  bio?: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  availableDays: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patient: Patient;
  patientId: number;
  doctor: Doctor;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'booked' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup';
  reason?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  isPriority: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  id: number;
  queueNumber: number;
  patient: Patient;
  patientId: number;
  status: 'waiting' | 'with_doctor' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reason?: string;
  notes?: string;
  calledAt?: string;
  completedAt?: string;
  estimatedWaitTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  total: number;
  waiting: number;
  withDoctor: number;
  completed: number;
  averageWaitTime: number;
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }
      
      const error = await response.json().catch(() => ({ message: 'Internal server error' }));
      throw new Error(error.message || 'Request failed');
    }

    // Check if response has content (not empty for DELETE operations)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // For responses without JSON content (like DELETE operations)
      return null;
    }
  }

  // Auth
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(userData: { username: string; password: string; fullName: string; role?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    return this.request('/doctors');
  }

  async getDoctor(id: number): Promise<Doctor> {
    return this.request(`/doctors/${id}`);
  }

  async createDoctor(doctorData: Partial<Doctor>): Promise<Doctor> {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async updateDoctor(id: number, doctorData: Partial<Doctor>): Promise<Doctor> {
    return this.request(`/doctors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(doctorData),
    });
  }

  async deleteDoctor(id: number): Promise<void> {
    return this.request(`/doctors/${id}`, {
      method: 'DELETE',
    });
  }

  async searchDoctors(params: { specialization?: string; location?: string; isAvailable?: boolean }): Promise<Doctor[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return this.request(`/doctors/search?${searchParams}`);
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    return this.request('/patients');
  }

  async getPatient(id: number): Promise<Patient> {
    return this.request(`/patients/${id}`);
  }

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient> {
    return this.request(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patientData),
    });
  }

  async deletePatient(id: number): Promise<void> {
    return this.request(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  async searchPatients(name: string): Promise<Patient[]> {
    return this.request(`/patients/search?name=${encodeURIComponent(name)}`);
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return this.request('/appointments');
  }

  async getAppointment(id: number): Promise<Appointment> {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
    return this.request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id: number): Promise<void> {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAppointmentStatus(id: number, status: Appointment['status']): Promise<Appointment> {
    return this.request(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return this.request(`/appointments/doctor/${doctorId}`);
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return this.request(`/appointments/patient/${patientId}`);
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    return this.request(`/appointments/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Queue
  async getQueue(): Promise<QueueItem[]> {
    return this.request('/queue');
  }

  async getActiveQueue(): Promise<QueueItem[]> {
    return this.request('/queue/active');
  }

  async getQueueStats(): Promise<QueueStats> {
    return this.request('/queue/stats');
  }

  async addToQueue(queueData: { patientId: number; priority?: QueueItem['priority']; reason?: string; notes?: string }): Promise<QueueItem> {
    return this.request('/queue', {
      method: 'POST',
      body: JSON.stringify(queueData),
    });
  }

  async updateQueueItem(id: number, queueData: Partial<QueueItem>): Promise<QueueItem> {
    return this.request(`/queue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(queueData),
    });
  }

  async updateQueueStatus(id: number, status: QueueItem['status']): Promise<QueueItem> {
    return this.request(`/queue/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async callNextInQueue(): Promise<QueueItem | null> {
    return this.request('/queue/call-next', {
      method: 'POST',
    });
  }

  async removeFromQueue(id: number): Promise<void> {
    return this.request(`/queue/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
