export type Appointment = {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string | null
  doctor: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
}

export type NewAppointment = Omit<Appointment, 'id' | 'created_at' | 'status'> & {
  status?: Appointment['status']
}

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: Appointment
        Insert: NewAppointment
        Update: Partial<Appointment>
      }
    }
  }
}
