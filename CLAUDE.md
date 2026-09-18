# Project: Professora Mariana (Teacher Management & Classroom App)
## Tech Stack
- Frontend: React (Vite) + Tailwind CSS + Lucide Icons + i18next (EN/PT)
- Backend: Supabase JS Client (Database + Storage Bucket `lesson-materials`)
- Hosting: GitHub Pages (Base path set to repository name)

## Navigation Structure
- **General Plan / Plano Geral:** Planning table (Themes, Activities, Manual Pages, Resources, Exercises, Registers).
- **Summaries / Sumários:** Presentation view for projection with lesson CRUD, year/group/date filtering, teacher drawer, and launchpad for the **Daily Self-Assessment / Autoavaliação Diária** modal per lesson.
- **Groups / Turmas:** CRUD management for Academic Years (`school_years`) and Classes/Forms (`school_forms`).
- **Students / Alunos:** Student CRUD with built-in initial group enrollment, optional inline guardian details on creation, and bulk CSV/XLS/XLSX import.

## Key Business Logic
- **Student Creation & Enrollment:** The "Add Student" modal includes mandatory dropdowns for **Academic Year** (`school_year_id`) and **Group/Turma** (`school_form_id`). It also includes optional fields for **Guardian Information** (Name, Phone, Email, Relationship). Submitting creates the student, enrollment, and guardian link in a single step.
- **Bulk Student Import:** Modal supporting file upload (`.csv`, `.xls`, `.xlsx`) or manual text paste. Automatically maps Process Number, Student Name, Birthdate, and optional Guardian fields, enrolling all imported students into the selected Academic Year and Group.
- **Lesson-Scoped Self-Assessment:** "Daily Self-Assessment" is launched directly from a specific lesson summary card via an **"Avaliação / Self-Assessment"** button in the Teacher View.
- **Assessment Modal (`OralEvaluation`):** Receives `lesson_id` automatically. Fetches students enrolled in that lesson's group (`school_form_id`) and academic year (`school_year_id`). Handles attendance (`is_attending`), student rating (1–5), teacher rating (1–5), and notes per student.
- **Public Presentation View:** School logo header (`https://www.esmax.pt/images/logoaemax.png`). Supports single and double lesson numbers (e.g., "Lição nº 13 e 14").
- **Media Support:** Direct uploads (Supabase Storage `lesson-materials` bucket) and external links.