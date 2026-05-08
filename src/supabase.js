import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dfgypgjonasevukjfltp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZ3lwZ2pvbmFzZXZ1a2pmbHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTgwNTAsImV4cCI6MjA4OTk5NDA1MH0.RaycF5x8FQz2v3M8Ww4QPIq5a-hUsr8Cm00tvyS__Jw'

export const supabase = createClient(supabaseUrl, supabaseKey)