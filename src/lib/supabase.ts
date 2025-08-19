import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// For local development, create a mock client if environment variables are missing
let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables. Using mock client for local development.')
  
  // Create a mock Supabase client for local development
  supabase = {
    from: () => ({
      insert: async () => ({ data: null, error: null }),
      select: async () => ({ data: null, error: null })
    })
  }
} else {
  // Create real Supabase client for production
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
