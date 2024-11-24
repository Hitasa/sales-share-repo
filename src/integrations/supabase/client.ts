import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgmgimpdrlqxnimolilx.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY'; // Replace with your actual anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});