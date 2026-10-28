import {
  Doctor,
  Specialty,
  Availability,
  Appointment,
  NotificationItem,
  MedicalRecord,
} from '../types';

export const MOCK_SPECIALTIES: Specialty[] = [
  { id: 1, name: 'Cardiologie' },
  { id: 2, name: 'Pédiatrie' },
  { id: 3, name: 'Dermatologie' },
  { id: 4, name: 'Neurologie' },
  { id: 5, name: 'Médecine Générale' },
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    userId: 101,
    nom: 'Dr. Jean Dupont',
    licence: 'LIC-CARD-2026-01',
    user: { id: 101, email: 'jean.dupont@hopital.fr', role: 'DOCTOR' },
    specialties: [{ doctorId: 1, specialtyId: 1, specialty: { id: 1, name: 'Cardiologie' } }],
  },
  {
    id: 2,
    userId: 102,
    nom: 'Dr. Claire Moreau',
    licence: 'LIC-PED-2026-02',
    user: { id: 102, email: 'claire.moreau@hopital.fr', role: 'DOCTOR' },
    specialties: [{ doctorId: 2, specialtyId: 2, specialty: { id: 2, name: 'Pédiatrie' } }],
  },
  {
    id: 3,
    userId: 103,
    nom: 'Dr. Marie Petit',
    licence: 'LIC-DERM-2026-03',
    user: { id: 103, email: 'marie.petit@hopital.fr', role: 'DOCTOR' },
    specialties: [{ doctorId: 3, specialtyId: 3, specialty: { id: 3, name: 'Dermatologie' } }],
  },
  {
    id: 4,
    userId: 104,
    nom: 'Dr. Lucas Lefebvre',
    licence: 'LIC-NEUR-2026-04',
    user: { id: 104, email: 'lucas.lefebvre@hopital.fr', role: 'DOCTOR' },
    specialties: [
      { doctorId: 4, specialtyId: 4, specialty: { id: 4, name: 'Neurologie' } },
      { doctorId: 4, specialtyId: 5, specialty: { id: 5, name: 'Médecine Générale' } },
    ],
  },
];

const tomorrow = new Date(Date.now() + 86400000);
const dayAfter = new Date(Date.now() + 2 * 86400000);

const makeSlot = (baseDate: Date, hour: number, minute = 0) => {
  const d = new Date(baseDate);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const MOCK_AVAILABILITIES: Availability[] = [
  {
    id: 1,
    doctorId: 1,
    start: makeSlot(tomorrow, 9, 0),
    end: makeSlot(tomorrow, 9, 30),
    doctor: { id: 1, nom: 'Dr. Jean Dupont' },
    appointment: { id: 1, statut: 'CONFIRMED' },
  },
  {
    id: 2,
    doctorId: 1,
    start: makeSlot(tomorrow, 10, 0),
    end: makeSlot(tomorrow, 10, 30),
    doctor: { id: 1, nom: 'Dr. Jean Dupont' },
    appointment: null,
  },
  {
    id: 3,
    doctorId: 1,
    start: makeSlot(tomorrow, 11, 0),
    end: makeSlot(tomorrow, 11, 30),
    doctor: { id: 1, nom: 'Dr. Jean Dupont' },
    appointment: null,
  },
  {
    id: 4,
    doctorId: 2,
    start: makeSlot(tomorrow, 14, 0),
    end: makeSlot(tomorrow, 14, 30),
    doctor: { id: 2, nom: 'Dr. Claire Moreau' },
    appointment: null,
  },
  {
    id: 5,
    doctorId: 3,
    start: makeSlot(dayAfter, 9, 30),
    end: makeSlot(dayAfter, 10, 0),
    doctor: { id: 3, nom: 'Dr. Marie Petit' },
    appointment: null,
  },
  {
    id: 6,
    doctorId: 4,
    start: makeSlot(dayAfter, 15, 0),
    end: makeSlot(dayAfter, 15, 30),
    doctor: { id: 4, nom: 'Dr. Lucas Lefebvre' },
    appointment: null,
  },
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 1,
    appointmentId: 2,
    diagnostic: 'Tension artérielle normale (12/8). ECG régulier. Continuer le suivi annuel.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    availabilityId: 1,
    statut: 'CONFIRMED',
    patient: {
      id: 1,
      nom: 'Amadou Diallo',
      dateNaissance: '1992-05-14T00:00:00.000Z',
    },
    doctor: {
      id: 1,
      nom: 'Dr. Jean Dupont',
      licence: 'LIC-CARD-2026-01',
    },
    availability: {
      id: 1,
      start: makeSlot(tomorrow, 9, 0),
      end: makeSlot(tomorrow, 9, 30),
    },
    medicalRecord: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 2,
    availabilityId: 99,
    statut: 'COMPLETED',
    patient: {
      id: 1,
      nom: 'Amadou Diallo',
      dateNaissance: '1992-05-14T00:00:00.000Z',
    },
    doctor: {
      id: 2,
      nom: 'Dr. Claire Moreau',
      licence: 'LIC-PED-2026-02',
    },
    availability: {
      id: 99,
      start: new Date(Date.now() - 4 * 86400000).toISOString(),
      end: new Date(Date.now() - 4 * 86400000 + 1800000).toISOString(),
    },
    medicalRecord: MOCK_MEDICAL_RECORDS[0],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    userId: 1,
    message: 'Votre rendez-vous avec Dr. Jean Dupont a été confirmé pour demain à 09h00.',
    lu: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    message: 'Nouveau compte-rendu médical disponible suite à votre consultation avec Dr. Claire Moreau.',
    lu: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];
