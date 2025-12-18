import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://acoezzxiuzftrvgpiyuk.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImU1ZjU5NWEzLTczZTQtNDA4NS05YWJjLTU3MjcxYmI3N2FkYSJ9.eyJwcm9qZWN0SWQiOiJhY29lenp4aXV6ZnRydmdwaXl1ayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY1NzU5MzQ3LCJleHAiOjIwODExMTkzNDcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.ruqAoPYCzIIJAoCJOEFxdR7CejVfsQfvwFfokEDpZys';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };