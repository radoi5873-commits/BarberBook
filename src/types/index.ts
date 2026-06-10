export type AppointmentStatus = 'en_attente' | 'confirme' | 'annule';

export interface Appointment {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface AppointmentFormData {
  full_name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
}

export interface DashboardStats {
  total: number;
  today: number;
  confirmed: number;
  pending: number;
}
