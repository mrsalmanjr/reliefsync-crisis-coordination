import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key'

const isConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url'

if (!isConfigured) {
  console.warn('Supabase credentials missing or invalid. Running in LOCAL TACTICAL MODE.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
