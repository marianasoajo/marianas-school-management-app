-- 1. Custom Types
CREATE TYPE eval_rating AS ENUM ('1', '2', '3', '4', '5');

-- 2. School Years (e.g., '2026/2027')
CREATE TABLE school_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE, -- e.g., '2026/2027'
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. School Forms / Classes (e.g., Grade 9, Class A)
CREATE TABLE school_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_level TEXT NOT NULL, -- e.g., '9º Ano' or 'Year 9'
  class_section TEXT NOT NULL, -- e.g., 'Turma A' or '5'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_form UNIQUE (year_level, class_section)
);

-- 4. Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  birthdate DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Student Form Enrolments (Tracks student form history across school years)
CREATE TABLE student_enrolments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  school_form_id UUID REFERENCES school_forms(id) ON DELETE RESTRICT,
  school_year_id UUID REFERENCES school_years(id) ON DELETE RESTRICT,
  group_number INT, -- Student number within the group/class (e.g., #1, #2)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_year UNIQUE (student_id, school_year_id)
);

-- 6. Guardians
CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Student-Guardian Relationship (Many-to-Many junction)
CREATE TABLE student_guardians (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
  relationship TEXT, -- e.g., 'Mother', 'Father', 'Legal Tutor'
  PRIMARY KEY (student_id, guardian_id)
);

-- 8. Planning Units (Interface 1) - Reusable Theme Content
CREATE TABLE planning_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_year_id UUID REFERENCES school_years(id) ON DELETE CASCADE,
  theme TEXT NOT NULL, -- Aprendizagens Essenciais
  activities TEXT,
  manual_pages TEXT,
  resources_physical TEXT,
  resources_digital TEXT,
  exercises_physical TEXT,
  exercises_digital TEXT,
  registers TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8b. Junction Table: Planning Units <-> School Forms (Many-to-Many)
CREATE TABLE planning_unit_forms (
  planning_unit_id UUID REFERENCES planning_units(id) ON DELETE CASCADE,
  school_form_id UUID REFERENCES school_forms(id) ON DELETE CASCADE,
  PRIMARY KEY (planning_unit_id, school_form_id)
);

-- 9. Lessons (Interface 2)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_year_id UUID REFERENCES school_years(id) ON DELETE RESTRICT,
  school_form_id UUID REFERENCES school_forms(id) ON DELETE RESTRICT,
  subject TEXT NOT NULL,
  lesson_number TEXT NOT NULL, -- e.g., '13' or '13 e 14'
  date DATE NOT NULL,
  summary TEXT, -- Sumário
  attention_box TEXT, -- Atenção
  teacher_notes TEXT, -- Hidden Modal Notes
  step_by_step JSONB DEFAULT '[]'::jsonb,
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Evaluations (Interface 3)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  is_attending BOOLEAN DEFAULT true,
  student_rating INT CHECK (student_rating BETWEEN 1 AND 5),
  teacher_rating INT CHECK (teacher_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_lesson_student_eval UNIQUE (lesson_id, student_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_unit_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (for development phase)
CREATE POLICY "Allow public access" ON school_years FOR ALL USING (true);
CREATE POLICY "Allow public access" ON school_forms FOR ALL USING (true);
CREATE POLICY "Allow public access" ON students FOR ALL USING (true);
CREATE POLICY "Allow public access" ON student_enrolments FOR ALL USING (true);
CREATE POLICY "Allow public access" ON guardians FOR ALL USING (true);
CREATE POLICY "Allow public access" ON student_guardians FOR ALL USING (true);
CREATE POLICY "Allow public access" ON planning_units FOR ALL USING (true);
CREATE POLICY "Allow public access" ON planning_unit_forms FOR ALL USING (true);
CREATE POLICY "Allow public access" ON lessons FOR ALL USING (true);
CREATE POLICY "Allow public access" ON evaluations FOR ALL USING (true);


-- 1. Helper function to re-number lessons sequentially by date for a given year & form
CREATE OR REPLACE FUNCTION renumber_lessons_for_group(p_year_id UUID, p_form_id UUID)
RETURNS VOID AS $$
DECLARE
  r RECORD;
  i INT := 1;
BEGIN
  FOR r IN 
    SELECT id, lesson_number 
    FROM lessons 
    WHERE school_year_id = p_year_id 
      AND school_form_id = p_form_id
    ORDER BY date ASC, created_at ASC
  LOOP
    -- Only update if the lesson_number differs to minimize write overhead
    IF r.lesson_number IS DISTINCT FROM i::text THEN
      UPDATE lessons 
      SET lesson_number = i::text 
      WHERE id = r.id;
    END IF;
    i := i + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger function that handles INSERT, UPDATE, and DELETE
CREATE OR REPLACE FUNCTION trigger_renumber_lessons()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent recursive trigger invocation during internal UPDATEs
  IF pg_trigger_depth() > 1 THEN
    RETURN NULL;
  END IF;

  -- Handle DELETE or OLD group on UPDATE
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
    IF OLD.school_year_id IS NOT NULL AND OLD.school_form_id IS NOT NULL THEN
      PERFORM renumber_lessons_for_group(OLD.school_year_id, OLD.school_form_id);
    END IF;
  END IF;

  -- Handle INSERT or NEW group/date on UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.school_year_id IS NOT NULL AND NEW.school_form_id IS NOT NULL THEN
      IF (TG_OP = 'INSERT') OR 
         (NEW.school_year_id <> OLD.school_year_id OR NEW.school_form_id <> OLD.school_form_id OR NEW.date <> OLD.date) THEN
        PERFORM renumber_lessons_for_group(NEW.school_year_id, NEW.school_form_id);
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger to lessons table
DROP TRIGGER IF EXISTS trg_renumber_lessons ON lessons;

CREATE TRIGGER trg_renumber_lessons
AFTER INSERT OR UPDATE OR DELETE ON lessons
FOR EACH ROW
EXECUTE FUNCTION trigger_renumber_lessons();