import { apiClient } from './client';
import {
  MOCK_APPOINTMENTS,
  MOCK_AVAILABILITIES,
  MOCK_DOCTORS,
  MOCK_MEDICAL_RECORDS,
  MOCK_NOTIFICATIONS,
  MOCK_SPECIALTIES,
} from './mockData';
import {
  Appointment,
  AppointmentStatus,
  Availability,
  CreateAppointmentPayload,
  CreateAvailabilityPayload,
  CreateBulkAvailabilityPayload,
  Doctor,
  MedicalRecord,
  NotificationItem,
  Patient,
  Specialty,
  UserProfile,
} from '../types';

// Local mutable state when operating in fallback mode
let localAppointments = [...MOCK_APPOINTMENTS];
let localAvailabilities = [...MOCK_AVAILABILITIES];
let localNotifications = [...MOCK_NOTIFICATIONS];
let localMedicalRecords = [...MOCK_MEDICAL_RECORDS];

function decodeJwtPayload(token: string): { sub?: number; role?: 'PATIENT' | 'DOCTOR' | 'ADMIN' } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });

      if (typeof data === 'string') {
        const token = data;
        const payload = decodeJwtPayload(token);
        const role = payload?.role || (email.toLowerCase().includes('doc') ? 'DOCTOR' : 'PATIENT');
        const userId = payload?.sub || 1;
        let patientId: number | null = null;
        let doctorId: number | null = null;
        let nom = email.split('@')[0];

        if (role === 'PATIENT') {
          try {
            const patRes = await apiClient.get<Patient>(`/patients/user/${userId}`);
            patientId = patRes.data.id;
            nom = patRes.data.nom;
          } catch {
            patientId = 1;
          }
        } else if (role === 'DOCTOR') {
          try {
            const docRes = await apiClient.get<Doctor>(`/medecins/user/${userId}`);
            doctorId = docRes.data.id;
            nom = docRes.data.nom;
          } catch {
            doctorId = 1;
          }
        }

        return {
          token,
          user: { id: userId, email, role, nom, patientId, doctorId },
        };
      }

      const token = data.token || data.access_token;
      const user: UserProfile = data.user || {
        id: data.createdUser?.id || 1,
        email,
        role: data.createdUser?.role || 'PATIENT',
        nom: data.patient?.nom || data.doctor?.nom || email.split('@')[0],
        patientId: data.patient?.id ?? null,
        doctorId: data.doctor?.id ?? null,
      };
      return { token, user };
    } catch (error: any) {
      if (error.response && (error.response.status === 401 || error.response.status === 400)) {
        throw new Error(error.response.data?.message || 'Identifiants invalides.');
      }
      // Demo fallback when backend server is unreachable
      const isDoctor = email.toLowerCase().includes('doc') || email.toLowerCase().includes('medecin') || email.toLowerCase().includes('dupont');
      const role = isDoctor ? 'DOCTOR' : 'PATIENT';
      return {
        token: 'demo-jwt-token-rvhospi',
        user: {
          id: isDoctor ? 101 : 1,
          email,
          role,
          nom: isDoctor ? 'Dr. Jean Dupont' : 'Amadou Diallo',
          patientId: isDoctor ? null : 1,
          doctorId: isDoctor ? 1 : null,
        },
      };
    }
  },

  async register(payload: {
    email: string;
    password: string;
    nom: string;
    dateNaissance: string;
  }): Promise<{ token: string; user: UserProfile }> {
    try {
      const { data } = await apiClient.post('/auth/register', payload);
      const token = data.token || data.access_token || 'registered-jwt-token';
      const user: UserProfile = data.user || {
        id: data.createdUser?.id || Date.now(),
        email: payload.email,
        role: 'PATIENT',
        nom: data.patient?.nom || payload.nom,
        patientId: data.patient?.id || 1,
        doctorId: null,
      };
      return { token, user };
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Erreur lors de l'inscription.");
      }
      return {
        token: 'demo-jwt-token-registered',
        user: {
          id: Date.now(),
          email: payload.email,
          role: 'PATIENT',
          nom: payload.nom,
          patientId: 1,
          doctorId: null,
        },
      };
    }
  },
};

export const hospitalApi = {
  async getSpecialties(): Promise<Specialty[]> {
    try {
      const { data } = await apiClient.get<Specialty[]>('/specialties');
      return data;
    } catch {
      return MOCK_SPECIALTIES;
    }
  },

  async getDoctors(): Promise<Doctor[]> {
    try {
      const { data } = await apiClient.get<Doctor[]>('/medecins');
      return data;
    } catch {
      return MOCK_DOCTORS;
    }
  },

  async getDoctorById(id: number): Promise<Doctor | undefined> {
    try {
      const { data } = await apiClient.get<Doctor>(`/medecins/${id}`);
      return data;
    } catch {
      return MOCK_DOCTORS.find((d) => d.id === id);
    }
  },

  async getAvailabilities(params?: {
    doctorId?: number;
    startDate?: string;
    endDate?: string;
    isBooked?: boolean;
  }): Promise<Availability[]> {
    try {
      const { data } = await apiClient.get<Availability[]>('/availabilities', { params });
      return data;
    } catch {
      return localAvailabilities.filter((slot) => {
        if (params?.doctorId && slot.doctorId !== params.doctorId) return false;
        if (params?.isBooked === false && slot.appointment !== null && slot.appointment !== undefined) return false;
        if (params?.isBooked === true && !slot.appointment) return false;
        return true;
      });
    }
  },

  async createAvailability(payload: CreateAvailabilityPayload): Promise<Availability> {
    try {
      const { data } = await apiClient.post<Availability>('/availabilities', payload);
      return data;
    } catch {
      const newSlot: Availability = {
        id: Date.now(),
        doctorId: payload.doctorId,
        start: payload.start,
        end: payload.end,
        appointment: null,
      };
      localAvailabilities = [...localAvailabilities, newSlot];
      return newSlot;
    }
  },

  async createBulkAvailability(payload: CreateBulkAvailabilityPayload): Promise<{ createdCount: number }> {
    try {
      const { data } = await apiClient.post('/availabilities/bulk', payload);
      return { createdCount: data.count ?? data.createdCount ?? 5 };
    } catch {
      const base = new Date(payload.startDate);
      const [sh, sm] = payload.startTime.split(':').map(Number);
      const slot1Start = new Date(base);
      slot1Start.setHours(sh || 9, sm || 0, 0, 0);
      const slot1End = new Date(slot1Start.getTime() + payload.slotDurationMinutes * 60000);
      const newSlot: Availability = {
        id: Date.now(),
        doctorId: payload.doctorId,
        start: slot1Start.toISOString(),
        end: slot1End.toISOString(),
        appointment: null,
      };
      localAvailabilities = [...localAvailabilities, newSlot];
      return { createdCount: 1 };
    }
  },

  async deleteAvailability(id: number): Promise<void> {
    try {
      await apiClient.delete(`/availabilities/${id}`);
    } catch {
      localAvailabilities = localAvailabilities.filter((a) => a.id !== id);
    }
  },

  async getAppointments(params?: {
    patientId?: number;
    doctorId?: number;
    statut?: AppointmentStatus;
  }): Promise<Appointment[]> {
    try {
      const { data } = await apiClient.get<Appointment[]>('/appointment', { params });
      return data;
    } catch {
      return localAppointments.filter((apt) => {
        if (params?.patientId && apt.patientId !== params.patientId) return false;
        if (params?.doctorId && apt.doctorId !== params.doctorId) return false;
        if (params?.statut && apt.statut !== params.statut) return false;
        return true;
      });
    }
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    try {
      const { data } = await apiClient.post<Appointment>('/appointment', payload);
      return data;
    } catch {
      const doc = MOCK_DOCTORS.find((d) => d.id === payload.doctorId);
      const slot = localAvailabilities.find((a) => a.id === payload.availabilityId);
      const created: Appointment = {
        id: Date.now(),
        patientId: payload.patientId,
        doctorId: payload.doctorId,
        availabilityId: payload.availabilityId,
        statut: payload.statut || 'PENDING',
        patient: {
          id: payload.patientId,
          nom: 'Amadou Diallo',
          dateNaissance: '1992-05-14T00:00:00.000Z',
        },
        doctor: doc
          ? { id: doc.id, nom: doc.nom, licence: doc.licence }
          : { id: payload.doctorId, nom: 'Médecin', licence: 'LIC-001' },
        availability: slot
          ? { id: slot.id, start: slot.start, end: slot.end }
          : { id: payload.availabilityId, start: new Date().toISOString(), end: new Date().toISOString() },
        medicalRecord: null,
        createdAt: new Date().toISOString(),
      };
      localAppointments = [created, ...localAppointments];
      localAvailabilities = localAvailabilities.map((a) =>
        a.id === payload.availabilityId ? { ...a, appointment: { id: created.id, statut: created.statut } } : a
      );
      return created;
    }
  },

  async updateAppointmentStatus(id: number, statut: AppointmentStatus): Promise<Appointment> {
    try {
      const { data } = await apiClient.patch<Appointment>(`/appointment/${id}`, { statut });
      return data;
    } catch {
      let updatedApt: Appointment | undefined;
      localAppointments = localAppointments.map((apt) => {
        if (apt.id === id) {
          updatedApt = { ...apt, statut };
          return updatedApt;
        }
        return apt;
      });
      if (!updatedApt) throw new Error('Rendez-vous introuvable');
      return updatedApt;
    }
  },

  async createMedicalRecord(appointmentId: number, diagnostic: string): Promise<MedicalRecord> {
    try {
      const { data } = await apiClient.post<MedicalRecord>('/medicals-records', {
        appointmentId,
        diagnostic,
      });
      return data;
    } catch {
      const record: MedicalRecord = {
        id: Date.now(),
        appointmentId,
        diagnostic,
        createdAt: new Date().toISOString(),
      };
      localMedicalRecords = [...localMedicalRecords, record];
      localAppointments = localAppointments.map((apt) =>
        apt.id === appointmentId ? { ...apt, medicalRecord: record, statut: 'COMPLETED' } : apt
      );
      return record;
    }
  },

  async updateMedicalRecord(id: number, diagnostic: string): Promise<MedicalRecord> {
    try {
      const { data } = await apiClient.patch<MedicalRecord>(`/medicals-records/${id}`, {
        diagnostic,
      });
      return data;
    } catch {
      const record: MedicalRecord = {
        id,
        appointmentId: 0,
        diagnostic,
        updatedAt: new Date().toISOString(),
      };
      localAppointments = localAppointments.map((apt) =>
        apt.medicalRecord?.id === id
          ? { ...apt, medicalRecord: { ...apt.medicalRecord, diagnostic } }
          : apt
      );
      return record;
    }
  },

  async getNotifications(userId: number): Promise<NotificationItem[]> {
    try {
      const { data } = await apiClient.get<NotificationItem[]>(`/notifications/user/${userId}`);
      return data;
    } catch {
      return localNotifications;
    }
  },

  async markNotificationAsRead(id: number): Promise<NotificationItem> {
    try {
      const { data } = await apiClient.patch<NotificationItem>(`/notifications/${id}/read`);
      return data;
    } catch {
      let target: NotificationItem | undefined;
      localNotifications = localNotifications.map((n) => {
        if (n.id === id) {
          target = { ...n, lu: true };
          return target;
        }
        return n;
      });
      return (
        target || {
          id,
          userId: 1,
          message: '',
          lu: true,
          createdAt: new Date().toISOString(),
        }
      );
    }
  },
};
