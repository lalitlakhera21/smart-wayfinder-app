-- 1. photo_url on rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Update submission-approval trigger to copy photo
CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.rooms (room, building, block, floor, type, direction, status, verified_by, verified_at, photo_url)
    VALUES (NEW.destination, NEW.building, NEW.block, NEW.floor, NEW.room_type, NEW.direction, 'verified', NEW.reviewed_by, now(), NEW.photo_url);
    NEW.reviewed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Faculty can update rooms
CREATE POLICY "Faculty can verify rooms"
ON public.rooms FOR UPDATE
USING (public.has_role(auth.uid(), 'faculty'));

-- 4. Faculty can review/view submissions
CREATE POLICY "Faculty review submissions"
ON public.room_submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'faculty'));

CREATE POLICY "Faculty view submissions"
ON public.room_submissions FOR SELECT
USING (public.has_role(auth.uid(), 'faculty'));

-- 5. room-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-photos', 'room-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view room photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-photos');

CREATE POLICY "Admin faculty upload room photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-photos' AND (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'faculty')
  )
);

CREATE POLICY "Admins delete room photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'room-photos' AND public.has_role(auth.uid(), 'admin'));

-- 6. room_reports
CREATE TYPE public.report_status AS ENUM ('open', 'resolved', 'dismissed');

CREATE TABLE public.room_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reporter_name TEXT,
  reporter_user_id UUID,
  status public.report_status NOT NULL DEFAULT 'open',
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.room_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report a room"
ON public.room_reports FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin faculty view reports"
ON public.room_reports FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'faculty') OR
  reporter_user_id = auth.uid()
);

CREATE POLICY "Admin faculty update reports"
ON public.room_reports FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'faculty')
);

CREATE POLICY "Admins delete reports"
ON public.room_reports FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_room_reports_status ON public.room_reports(status);
CREATE INDEX idx_room_reports_room ON public.room_reports(room_id);