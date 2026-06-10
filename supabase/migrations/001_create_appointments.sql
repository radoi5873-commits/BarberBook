-- ============================================
-- BarberBook — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Create enum for appointment status
CREATE TYPE appointment_status AS ENUM ('en_attente', 'confirme', 'annule');

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status appointment_status DEFAULT 'en_attente' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for booking form)
CREATE POLICY "Allow anonymous inserts" ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous reads (for admin dashboard)
CREATE POLICY "Allow anonymous reads" ON appointments
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow anonymous updates (for status changes)
CREATE POLICY "Allow anonymous updates" ON appointments
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anonymous deletes (for removing appointments)
CREATE POLICY "Allow anonymous deletes" ON appointments
  FOR DELETE
  TO anon
  USING (true);

-- Note: In production, replace anon policies with authenticated
-- policies and implement proper authentication.
