import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
const supabaseUrl = 'https://bujabrkizhhyiadbxieo.supabase.co';
const supabaseAnonKey = 'sb_publishable_m1eBiRSLO2GpxPilr3KdgA_B506FbTu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export { supabase };