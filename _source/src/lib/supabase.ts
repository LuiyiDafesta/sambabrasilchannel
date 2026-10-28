import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tgiysffinqhwpyuebmon.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnaXlzZmZpbnFod3B5dWVibW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5OTE1NjQsImV4cCI6MjEwNzU2NzU2NH0.TfyC4gq_OBqii7Y4VbRRQS9bvgX0n0cG016rhckSxPA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
