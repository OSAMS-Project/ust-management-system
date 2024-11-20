import { createClient } from '@supabase/supabase-js';

console.log('SUPABASE URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('SUPABASE KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://uavbcuwklwnseoepnihz.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdmJjdXdrbHduc2VvZXBuaWh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTg3MzE5MSwiZXhwIjoyMDQ3NDQ5MTkxfQ.F5dNI4_YoU1UkO5uHLygFbNz8WvBk5hajJmsDUSb-h0";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 