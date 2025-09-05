import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Using mock mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database schema setup SQL (run this in Supabase SQL editor)
export const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  preferred_language TEXT DEFAULT 'english' CHECK (preferred_language IN ('english', 'spanish')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recorded incidents table
CREATE TABLE IF NOT EXISTS recorded_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location_lat DECIMAL,
  location_lng DECIMAL,
  location_address TEXT,
  audio_file_path TEXT,
  notes TEXT,
  shared_with_contacts BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rights guides table (pre-populated with state data)
CREATE TABLE IF NOT EXISTS rights_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  content JSONB NOT NULL,
  language TEXT DEFAULT 'english',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recorded_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own incidents" ON recorded_incidents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own incidents" ON recorded_incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own incidents" ON recorded_incidents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own contacts" ON emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON emergency_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON emergency_contacts FOR DELETE USING (auth.uid() = user_id);

-- Rights guides are public (read-only)
CREATE POLICY "Anyone can view rights guides" ON rights_guides FOR SELECT TO public USING (true);
`

// User management functions
export const userService = {
  async signUp(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    
    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            subscription_status: 'free',
            preferred_language: 'english'
          }
        ])
      
      if (profileError) throw profileError
    }
    
    return data
  },

  async signIn(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    if (!supabase) return null
    
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getUserProfile(userId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserProfile(userId, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Incident management functions
export const incidentService = {
  async createIncident(incidentData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('recorded_incidents')
      .insert([incidentData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserIncidents(userId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('recorded_incidents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateIncident(incidentId, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('recorded_incidents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', incidentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteIncident(incidentId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('recorded_incidents')
      .delete()
      .eq('id', incidentId)
    
    if (error) throw error
  }
}

// Emergency contacts management
export const contactService = {
  async getEmergencyContacts(userId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addEmergencyContact(userId, contactData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([{ ...contactData, user_id: userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateEmergencyContact(contactId, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteEmergencyContact(contactId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId)
    
    if (error) throw error
  }
}

// Rights guides management
export const rightsService = {
  async getRightsGuide(state, language = 'english') {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('rights_guides')
      .select('*')
      .eq('state', state)
      .eq('language', language)
      .single()
    
    if (error) throw error
    return data
  },

  async getAllRightsGuides() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('rights_guides')
      .select('*')
      .order('state')
    
    if (error) throw error
    return data
  }
}

// File storage functions
export const storageService = {
  async uploadAudioFile(file, fileName) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.storage
      .from('audio-recordings')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    return data
  },

  async getAudioFileUrl(fileName) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data } = supabase.storage
      .from('audio-recordings')
      .getPublicUrl(fileName)
    
    return data.publicUrl
  },

  async deleteAudioFile(fileName) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase.storage
      .from('audio-recordings')
      .remove([fileName])
    
    if (error) throw error
  }
}
