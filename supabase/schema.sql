CREATE TYPE eval_rating AS ENUM ('1', '2', '3', '4', '5');

CREATE TABLE planning_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT NOT NULL,
  activities TEXT,
  manual_pages TEXT,
  resources_physical TEXT,
  resources_digital TEXT,
  exercises_physical TEXT,
  exercises_digital TEXT,
  registers TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_number TEXT NOT NULL,
  date DATE NOT NULL,
  level_group TEXT NOT NULL,
  subject TEXT NOT NULL,
  summary TEXT,
  attention_box TEXT,
  teacher_notes TEXT,
  step_by_step JSONB DEFAULT '[]'::jsonb,
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_rating INT CHECK (student_rating BETWEEN 1 AND 5),
  teacher_rating INT CHECK (teacher_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE planning_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" ON planning_units FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write access" ON planning_units FOR ALL USING (true);

CREATE POLICY "Allow anonymous read access" ON lessons FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write access" ON lessons FOR ALL USING (true);

CREATE POLICY "Allow anonymous read access" ON evaluations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write access" ON evaluations FOR ALL USING (true);