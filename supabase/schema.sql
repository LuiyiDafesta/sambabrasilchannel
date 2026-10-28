-- ====================================================================
-- Samba Brasil Channel - Production Database Schema & Security Rules
-- Supabase Project: tgiysffinqhwpyuebmon
-- ====================================================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Keepalive table (verifies project health and connectivity)
CREATE TABLE IF NOT EXISTS public.keepalive (
    key TEXT PRIMARY KEY,
    touched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.keepalive (key, touched_at)
VALUES ('samba_brasil_channel_init', NOW())
ON CONFLICT (key) DO UPDATE SET touched_at = EXCLUDED.touched_at;

-- 2. Profiles Table (User Roles & Security)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Security Definer Helper Function to verify admin role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 4. Automatic Profile Creator on User Registration
-- Protects role elevation: new registrations default to 'viewer' unless designated admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE
      WHEN new.email = 'lsnetinformatica2024@gmail.com' THEN 'admin'
      ELSE 'viewer'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      role = CASE
        WHEN EXCLUDED.email = 'lsnetinformatica2024@gmail.com' THEN 'admin'
        ELSE profiles.role
      END,
      updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Vueltas Table
CREATE TABLE IF NOT EXISTS public.vueltas (
  id TEXT PRIMARY KEY DEFAULT ('v-' || floor(extract(epoch from now()))::text),
  code TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  destination TEXT NOT NULL DEFAULT 'Camboriú',
  transport_type TEXT NOT NULL DEFAULT 'airplane',
  transport_details TEXT DEFAULT '',
  coordinator_name TEXT DEFAULT 'Coordinador General',
  status TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador', 'publicada', 'cerrada')),
  cover_image TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Schools Table
CREATE TABLE IF NOT EXISTS public.schools (
  id TEXT PRIMARY KEY DEFAULT ('sch-' || floor(extract(epoch from now()))::text || '-' || substr(md5(random()::text), 1, 4)),
  vuelta_id TEXT NOT NULL REFERENCES public.vueltas(id) ON DELETE CASCADE,
  contract_code TEXT NOT NULL,
  name TEXT NOT NULL,
  pax_count INTEGER NOT NULL DEFAULT 0,
  city TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Photos Table (Restricted write access to verified admins)
CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY DEFAULT ('photo-' || floor(extract(epoch from now()))::text || '-' || substr(md5(random()::text), 1, 4)),
  vuelta_id TEXT NOT NULL REFERENCES public.vueltas(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'momentos' CHECK (category IN ('todas', 'momentos', 'destino', 'carnaval')),
  filename TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_vueltas_date ON public.vueltas(date);
CREATE INDEX IF NOT EXISTS idx_vueltas_code ON public.vueltas(code);
CREATE INDEX IF NOT EXISTS idx_vueltas_status ON public.vueltas(status);
CREATE INDEX IF NOT EXISTS idx_schools_vuelta_id ON public.schools(vuelta_id);
CREATE INDEX IF NOT EXISTS idx_photos_vuelta_id ON public.photos(vuelta_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 9. Row Level Security (RLS) Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vueltas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keepalive ENABLE ROW LEVEL SECURITY;

-- 10. Security Policies: PROFILES
DROP POLICY IF EXISTS "Users can read own profile or admin reads all" ON public.profiles;
CREATE POLICY "Users can read own profile or admin reads all"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 11. Security Policies: VUELTAS
DROP POLICY IF EXISTS "Public can view published vueltas or admin views all" ON public.vueltas;
CREATE POLICY "Public can view published vueltas or admin views all"
  ON public.vueltas FOR SELECT
  TO authenticated, anon
  USING (status = 'publicada' OR public.is_admin());

DROP POLICY IF EXISTS "Only admin can insert vueltas" ON public.vueltas;
CREATE POLICY "Only admin can insert vueltas"
  ON public.vueltas FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can update vueltas" ON public.vueltas;
CREATE POLICY "Only admin can update vueltas"
  ON public.vueltas FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete vueltas" ON public.vueltas;
CREATE POLICY "Only admin can delete vueltas"
  ON public.vueltas FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 12. Security Policies: SCHOOLS
DROP POLICY IF EXISTS "Public can view schools of published vueltas or admin views all" ON public.schools;
CREATE POLICY "Public can view schools of published vueltas or admin views all"
  ON public.schools FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.vueltas v
      WHERE v.id = schools.vuelta_id
      AND (v.status = 'publicada' OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Only admin can insert schools" ON public.schools;
CREATE POLICY "Only admin can insert schools"
  ON public.schools FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can update schools" ON public.schools;
CREATE POLICY "Only admin can update schools"
  ON public.schools FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete schools" ON public.schools;
CREATE POLICY "Only admin can delete schools"
  ON public.schools FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 13. Security Policies: PHOTOS (Only admins can upload and manage photos)
DROP POLICY IF EXISTS "Public can view photos of published vueltas or admin views all" ON public.photos;
CREATE POLICY "Public can view photos of published vueltas or admin views all"
  ON public.photos FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.vueltas v
      WHERE v.id = photos.vuelta_id
      AND (v.status = 'publicada' OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Only admin can insert photos" ON public.photos;
CREATE POLICY "Only admin can insert photos"
  ON public.photos FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can update photos" ON public.photos;
CREATE POLICY "Only admin can update photos"
  ON public.photos FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete photos" ON public.photos;
CREATE POLICY "Only admin can delete photos"
  ON public.photos FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 14. APP SETTINGS (Webhook n8n, DreamsCDA toggle, Tracking Scripts, AnyChat)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view settings" ON public.app_settings;
CREATE POLICY "Public can view settings"
  ON public.app_settings FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Only admin can update settings" ON public.app_settings;
CREATE POLICY "Only admin can update settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 15. SURVEYS TABLE
CREATE TABLE IF NOT EXISTS public.surveys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active surveys or admin views all" ON public.surveys;
CREATE POLICY "Public can view active surveys or admin views all"
  ON public.surveys FOR SELECT
  TO authenticated, anon
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admin can manage surveys" ON public.surveys;
CREATE POLICY "Only admin can manage surveys"
  ON public.surveys FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 16. SURVEY RESPONSES (PASSENGER LEADS) TABLE
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id uuid REFERENCES public.surveys(id) ON DELETE CASCADE,
  survey_title text,
  lead_name text NOT NULL,
  lead_email text NOT NULL,
  lead_phone text,
  group_code text,
  school_name text,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert survey responses" ON public.survey_responses;
CREATE POLICY "Public can insert survey responses"
  ON public.survey_responses FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admin can view or delete responses" ON public.survey_responses;
CREATE POLICY "Only admin can view or delete responses"
  ON public.survey_responses FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
