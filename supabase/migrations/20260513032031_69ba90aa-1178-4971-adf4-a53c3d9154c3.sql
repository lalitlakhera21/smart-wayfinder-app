
-- Locations (graph nodes)
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'landmark',
  building text,
  block text,
  floor text,
  wing text,
  description text,
  photo_url text,
  is_verified boolean NOT NULL DEFAULT true,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_type ON public.locations(type);
CREATE INDEX idx_locations_building ON public.locations(building);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Admins insert locations" ON public.locations FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins update locations" ON public.locations FOR UPDATE USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins delete locations" ON public.locations FOR DELETE USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Connections (graph edges, directional)
CREATE TABLE public.location_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  to_location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  direction text NOT NULL DEFAULT 'Straight',
  distance_m integer NOT NULL DEFAULT 10,
  estimated_seconds integer NOT NULL DEFAULT 30,
  instruction text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_location_id, to_location_id)
);

CREATE INDEX idx_conn_from ON public.location_connections(from_location_id);
CREATE INDEX idx_conn_to ON public.location_connections(to_location_id);

ALTER TABLE public.location_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view connections" ON public.location_connections FOR SELECT USING (true);
CREATE POLICY "Admins insert connections" ON public.location_connections FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins update connections" ON public.location_connections FOR UPDATE USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins delete connections" ON public.location_connections FOR DELETE USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON public.location_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
