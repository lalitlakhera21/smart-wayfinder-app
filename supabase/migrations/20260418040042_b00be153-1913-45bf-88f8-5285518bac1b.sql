-- Status enum for rooms (reuse pattern)
CREATE TYPE public.room_status AS ENUM ('pending', 'verified', 'rejected');

ALTER TABLE public.rooms
  ADD COLUMN status public.room_status NOT NULL DEFAULT 'pending',
  ADD COLUMN verified_by UUID,
  ADD COLUMN verified_at TIMESTAMPTZ;

-- Mark existing rooms as verified (admin-curated baseline)
UPDATE public.rooms SET status = 'verified', verified_at = now();

-- Update the submission-approval trigger so approved submissions create verified rooms
CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.rooms (room, building, block, floor, type, direction, status, verified_by, verified_at)
    VALUES (NEW.destination, NEW.building, NEW.block, NEW.floor, NEW.room_type, NEW.direction, 'verified', NEW.reviewed_by, now());
    NEW.reviewed_at = now();
  END IF;
  RETURN NEW;
END;
$$;