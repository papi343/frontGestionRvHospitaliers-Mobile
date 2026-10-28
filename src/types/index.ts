export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface UserProfile {
  id: number;
  email: string;
  role: Role;
  nom: string;
  patientId?: number | null;
  doctorId?: number | null;
}

export interface Patient {
  id: number;
  userId: number;
  nom: string;
  dateNaissance: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Specialty {
  id: number;
  name: string;
}

export interface DoctorSpecialty {
  doctorId: number;
  specialtyId: number;
  specialty: Specialty;
}

export interface Doctor {
  id: number;
  userId?: number;
  nom: string;
  licence: string;
  user?: {
    id: number;
    email: string;
    role: Role;
  };
  specialties?: DoctorSpecialty[];
}

export interface Availability {
  id: number;
  doctorId: number;
  start: string;
  end: string;
  doctor?: {
    id: number;
    nom: string;
  };
  appointment?: {
    id: number;
    statut: AppointmentStatus;
  } | null;
}

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  diagnostic: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  availabilityId: number;
  statut: AppointmentStatus;
  patient?: {
    id: number;
    nom: string;
    dateNaissance: string;
  };
  doctor?: {
    id: number;
    nom: string;
    licence: string;
  };
  availability?: {
    id: number;
    start: string;
    end: string;
  };
  medicalRecord?: MedicalRecord | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  message: string;
  lu: boolean;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  patientId: number;
  doctorId: number;
  availabilityId: number;
  statut?: AppointmentStatus;
}

export interface CreateAvailabilityPayload {
  doctorId: number;
  start: string;
  end: string;
}

export interface CreateBulkAvailabilityPayload {
  doctorId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  daysOfWeek?: number[];
  breakStartTime?: string;
  breakEndTime?: string;
}
