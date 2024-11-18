import { createClient } from '@supabase/supabase-js';

console.log('SUPABASE URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('SUPABASE KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://uavbcuwklwnseoepnihz.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdmJjdXdrbHduc2VvZXBuaWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NzMxOTEsImV4cCI6MjA0NzQ0OTE5MX0.4C7FbRGxMI6SkQ6FKh_nNJWMJ26XUGoSbTJrnfkWV1Y";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 