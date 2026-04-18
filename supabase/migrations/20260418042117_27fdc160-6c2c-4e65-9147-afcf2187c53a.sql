-- Create departments table mapping Building → Category → Program
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_name TEXT NOT NULL,
  category TEXT NOT NULL,
  program_name TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_departments_building ON public.departments(building_name);
CREATE INDEX idx_departments_category ON public.departments(category);
CREATE INDEX idx_departments_program ON public.departments(program_name);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Anyone can view departments (public directory)
CREATE POLICY "Anyone can view departments"
  ON public.departments FOR SELECT
  USING (true);

-- Admins full control
CREATE POLICY "Admins can insert departments"
  ON public.departments FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update departments"
  ON public.departments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete departments"
  ON public.departments FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Faculty can update (correct info)
CREATE POLICY "Faculty can update departments"
  ON public.departments FOR UPDATE
  USING (has_role(auth.uid(), 'faculty'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the data
INSERT INTO public.departments (building_name, category, program_name, type) VALUES
  -- TECHNOLOGY BLOCK
  ('Technology Block', 'Engineering & IT', 'B.Tech', 'UG'),
  ('Technology Block', 'Engineering & IT', 'M.Tech', 'PG'),
  ('Technology Block', 'Engineering & IT', 'BCA', 'UG'),
  ('Technology Block', 'Engineering & IT', 'MCA', 'PG'),
  ('Technology Block', 'Sciences', 'Forensic Science', 'UG'),
  ('Technology Block', 'Sciences', 'Biotechnology', 'UG'),
  ('Technology Block', 'Sciences', 'Microbiology', 'UG'),
  ('Technology Block', 'Sciences', 'Physics', 'UG'),
  ('Technology Block', 'Pharmacy', 'B.Pharm', 'UG'),
  ('Technology Block', 'Pharmacy', 'D.Pharm', 'UG'),
  -- ACADEMIC BLOCK
  ('Academic Block', 'Professional Studies', 'MBA', 'PG'),
  ('Academic Block', 'Professional Studies', 'BBA', 'UG'),
  ('Academic Block', 'Professional Studies', 'B.Com', 'UG'),
  ('Academic Block', 'Professional Studies', 'BA LLB', 'UG'),
  ('Academic Block', 'Professional Studies', 'LLB', 'PG'),
  ('Academic Block', 'Health Sciences', 'Physiotherapy (BPT)', 'UG'),
  ('Academic Block', 'Health Sciences', 'Optometry', 'UG'),
  ('Academic Block', 'Health Sciences', 'Paramedical', 'UG'),
  ('Academic Block', 'Humanities', 'Psychology', 'UG'),
  ('Academic Block', 'Humanities', 'English', 'UG'),
  ('Academic Block', 'Humanities', 'Journalism (BA JMC)', 'UG'),
  ('Academic Block', 'Agriculture', 'B.Sc Agriculture (Theory)', 'UG'),
  -- ADMINISTRATIVE BLOCK
  ('Administrative Block', 'Operations', 'PhD Coordination', 'Research'),
  ('Administrative Block', 'Operations', 'Online Education (CDOE)', NULL),
  ('Administrative Block', 'Operations', 'Admissions Office', NULL),
  ('Administrative Block', 'Operations', 'Registrar Office', NULL),
  -- CODE BUILDING
  ('Code Building (Design Centre)', 'Creative Arts', 'B.Arch', 'UG'),
  ('Code Building (Design Centre)', 'Creative Arts', 'B.Des', 'UG');