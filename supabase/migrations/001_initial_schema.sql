-- ====================================================================
-- SafeSphere AI: Initial Database Schema & Row Level Security (RLS)
-- Tables: alerts, sos_alerts, shelters_cache
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- TABLE 1: alerts
-- Real-time and historical disaster/emergency alerts
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('flood', 'cyclone', 'earthquake', 'wildfire', 'tsunami', 'storm', 'general')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    source TEXT NOT NULL DEFAULT 'NASA_EONET',
    external_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast querying & spatial bounding box lookups
CREATE INDEX IF NOT EXISTS idx_alerts_category ON public.alerts (category);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts (severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at_desc ON public.alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_lat_lng ON public.alerts (latitude, longitude);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone (anon + authenticated) can view active alerts
CREATE POLICY "Public read access for active alerts"
    ON public.alerts
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Enable Supabase Realtime publication for alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;


-- ====================================================================
-- TABLE 2: sos_alerts
-- Real-time emergency distress signals & rescue dispatch records
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT,
    sender_phone TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy_meters DOUBLE PRECISION,
    battery_level INTEGER,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'dispatched', 'resolved', 'cancelled')),
    emergency_type TEXT NOT NULL DEFAULT 'general_emergency',
    message TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for dispatcher and response metrics
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON public.sos_alerts (status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_created_at_desc ON public.sos_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON public.sos_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_lat_lng ON public.sos_alerts (latitude, longitude);

-- Enable RLS
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Anyone (including unauthenticated emergency victims) can trigger an SOS
CREATE POLICY "Anyone can create an emergency SOS alert"
    ON public.sos_alerts
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- RLS Policy 2: Users can view their own submitted SOS alerts
CREATE POLICY "Users can view their own SOS alerts"
    ON public.sos_alerts
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- Enable Supabase Realtime publication for sos_alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;


-- ====================================================================
-- TABLE 3: shelters_cache
-- Offline & cached registry of shelters, hospitals, and assembly points
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.shelters_cache (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('shelter', 'hospital', 'assembly_point', 'relief_camp')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    phone TEXT,
    capacity INTEGER DEFAULT 100,
    current_occupancy INTEGER DEFAULT 0,
    is_operational BOOLEAN NOT NULL DEFAULT true,
    amenities JSONB DEFAULT '[]'::jsonb,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for shelter filtering and geographic sorting
CREATE INDEX IF NOT EXISTS idx_shelters_cache_type ON public.shelters_cache (type);
CREATE INDEX IF NOT EXISTS idx_shelters_cache_operational ON public.shelters_cache (is_operational);
CREATE INDEX IF NOT EXISTS idx_shelters_cache_lat_lng ON public.shelters_cache (latitude, longitude);

-- Enable RLS
ALTER TABLE public.shelters_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access to operational shelters & hospitals
CREATE POLICY "Public read access for shelters"
    ON public.shelters_cache
    FOR SELECT
    TO anon, authenticated
    USING (true);


-- ====================================================================
-- Trigger for automatic updated_at timestamp maintenance
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_alerts_updated_at ON public.alerts;
CREATE TRIGGER tr_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_sos_alerts_updated_at ON public.sos_alerts;
CREATE TRIGGER tr_sos_alerts_updated_at
    BEFORE UPDATE ON public.sos_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
