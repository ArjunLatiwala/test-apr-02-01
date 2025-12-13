import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Database features will be disabled.')
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Helper functions for database operations
export async function createPatient(email, name = null, gender = null) {
  if (!supabase) return { id: 'mock-patient-id' }
  
  // Check if patient exists
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('email', email)
    .single()
  
  if (existing) return existing

  const { data, error } = await supabase
    .from('patients')
    .insert({ email, name, gender })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createSession(patientId, doctorId = null) {
  if (!supabase) {
    return { 
      id: `mock-session-${Date.now()}`,
      patient_id: patientId,
      doctor_id: doctorId,
      status: 'in_progress',
      created_at: new Date().toISOString()
    }
  }
  
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateSession(sessionId, updates) {
  if (!supabase) return { id: sessionId, ...updates }
  
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getSession(sessionId) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      patients (id, email, name, gender),
      insights (*)
    `)
    .eq('id', sessionId)
    .single()
  
  if (error) throw error
  return data
}

export async function getSessions(doctorId = null, status = null) {
  if (!supabase) return []
  
  let query = supabase
    .from('sessions')
    .select(`
      *,
      patients (id, email, name, gender),
      insights (id, flagged_concerns)
    `)
    .order('created_at', { ascending: false })
  
  if (doctorId) {
    query = query.eq('doctor_id', doctorId)
  }
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function createInsights(sessionId, insights) {
  if (!supabase) return { id: 'mock-insight-id', session_id: sessionId, ...insights }
  
  // Check if insights already exist
  const { data: existing } = await supabase
    .from('insights')
    .select('id')
    .eq('session_id', sessionId)
    .single()
  
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('insights')
      .update({
        ...insights,
        generated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('insights')
    .insert({
      session_id: sessionId,
      ...insights,
      generated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getInsights(sessionId) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('session_id', sessionId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Doctor operations
export async function createDoctor(email, passwordHash, name) {
  if (!supabase) {
    return { 
      id: 'mock-doctor-id',
      email,
      name,
      created_at: new Date().toISOString()
    }
  }
  
  const { data, error } = await supabase
    .from('doctors')
    .insert({ email, password_hash: passwordHash, name })
    .select('id, email, name, created_at')
    .single()
  
  if (error) throw error
  return data
}

export async function getDoctorByEmail(email) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

