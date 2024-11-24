import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgmgimpdrlqxnimolilx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnbWdpbXBkcmxxeG5pbW9saWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0NTAzMzksImV4cCI6MjA0ODAyNjMzOX0.1wHB68KPfuU3Aaa7lxGmcygT-BpdeNheXmzmGQVXJuM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});