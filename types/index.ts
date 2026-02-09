export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  status: string;
  description: string;
  created_at?: string;
  agent_id?: string | null;
}

export type ProfileRole = 'admin' | 'user';

export type ProfileStatus = 'pending' | 'pending_approval' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role: ProfileRole;
  status: ProfileStatus;
}

export interface Lead {
  id: string;
  user_id: string;
  property_id: string;
  message: string;
  created_at?: string;
}

export interface LeadWithDetails extends Lead {
  profiles?: Pick<Profile, 'id' | 'full_name' | 'email'> | null;
  properties?: Pick<Property, 'id' | 'title'> | null;
}

export interface Appointment {
  id: string;
  property_id: string;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string | null;
  created_at?: string;
}

export interface AppointmentWithDetails extends Appointment {
  properties?: Pick<Property, 'id' | 'title' | 'location'> | null;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'email'> | null;
}
