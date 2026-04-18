-- Submission status enum
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');

-- room_submissions table
CREATE TABLE public.room_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination TEXT NOT NULL,
  building TEXT NOT NULL,
  block TEXT NOT NULL DEFAULT '',
  floor TEXT NOT NULL,
  room_type TEXT NOT NULL DEFAULT 'Classroom',
  direction TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  submitter_role TEXT NOT NULL DEFAULT 'student',
  submitter_user_id UUID,
  photo_url TEXT,
  status public.submission_status NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.room_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (even anon) can insert a submission
CREATE POLICY "Anyone can submit a room"
ON public.room_submissions FOR INSERT
WITH CHECK (true);

-- Submitter can view own; admins can view all
CREATE POLICY "View own submissions"
ON public.room_submissions FOR SELECT
USING (submitter_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Admins update (approve/reject)
CREATE POLICY "Admins update submissions"
ON public.room_submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins delete
CREATE POLICY "Admins delete submissions"
ON public.room_submissions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger: when approved, copy into rooms
CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.rooms (room, building, block, floor, type, direction)
    VALUES (NEW.destination, NEW.building, NEW.block, NEW.floor, NEW.room_type, NEW.direction);
    NEW.reviewed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_submission_approved
BEFORE UPDATE ON public.room_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_submission_approval();

-- updated_at trigger
CREATE TRIGGER update_room_submissions_updated_at
BEFORE UPDATE ON public.room_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for submission photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('submission-photos', 'submission-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view submission photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'submission-photos');

CREATE POLICY "Anyone can upload submission photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'submission-photos');

CREATE POLICY "Admins can delete submission photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'submission-photos' AND public.has_role(auth.uid(), 'admin'));