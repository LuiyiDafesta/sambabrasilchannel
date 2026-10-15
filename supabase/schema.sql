-- ===================================================
-- Samba Brasil Channel - Initial Database Schema
-- Supabase Project: tgiysffinqhwpyuebmon
-- ===================================================

-- Keepalive table (verifies project health and connectivity)
CREATE TABLE IF NOT EXISTS public.keepalive (
    key TEXT PRIMARY KEY,
    touched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial keepalive ping
INSERT INTO public.keepalive (key, touched_at)
VALUES ('samba_brasil_channel_init', NOW())
ON CONFLICT (key) DO UPDATE SET touched_at = EXCLUDED.touched_at;
