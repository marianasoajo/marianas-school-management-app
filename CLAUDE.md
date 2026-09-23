# Project: EduPlanner (Teacher Management & Classroom App)
## Tech Stack
- Frontend: React (Vite) + Tailwind CSS + Lucide Icons + i18next (EN/PT)
- Backend: Supabase JS Client (Database + Storage Bucket `lesson-materials`)
- Hosting: GitHub Pages (Base path set to repository name)
- Authentication: Supabase password-based authentication (email/password only)

## Navigation Structure
- **Summaries / Sumários (Homepage):** Teacher view with lesson list showing summary and attention box for each lesson. Clicking a lesson expands to show teacher notes. Includes year/group/date filtering, lesson CRUD, import summaries from other groups, and launchpad for **Daily Self-Assessment / Autoavaliação Diária** per lesson. Green eye icon launches full-screen student presentation mode.
- **Evaluation Filter / Filtro de Avaliação:** Filter and view student evaluation averages by group, student, and date range. Results ordered by class number or average rating.
- **General Plan / Plano Geral:** Planning table (Themes, Activities, Manual Pages, Resources, Exercises, Registers).
- **Groups / Turmas:** CRUD management for Academic Years (`school_years`) and Classes/Forms (`school_forms`).
- **Students / Alunos:** Student CRUD with built-in initial group enrolment, optional inline guardian details on creation, and bulk CSV/XLS/XLSX import.

## Key Business Logic
- **Authentication:** Login screen with email and password fields only. Auth guard in App.jsx checks session status on load and shows Login component when unauthenticated. Logout button in top header. All components receive `session` prop and guard queries with `if (!session) return` to prevent 401 errors.
- **Homepage:** Summaries/lesson list is the default homepage (App.jsx `activeTab = 'summaries'`).
- **Student Creation & Enrolment:** The "Add Student" modal includes mandatory dropdowns for **Academic Year** (`school_year_id`) and **Group/Turma** (`school_form_id`). It also includes optional fields for **Guardian Information** (Name, Phone, Email, Relationship). Submitting creates the student, enrolment, and guardian link in a single step.
- **Bulk Student Import:** Modal supporting file upload (`.csv`, `.xls`, `.xlsx`) or manual text paste. Requires **Academic Year** and **Group** selection before import. Automatically maps Process Number, Student Name, Birthdate, Group Number, and optional Guardian fields. Validates year and group exist; if not found but valid entries are provided, creates missing year/group records automatically. All imported students are enrolled into the selected Academic Year and Group.
- **Lesson Management:** Auto-incrementing lesson numbers when creating (queries last number for year/group and increments). Auto-decrementing (cascade renumbering) when deleting a lesson—all subsequent lessons in the same year/group have their numbers decremented by 1.
- **Import Summaries Feature:** Copy all lessons from one group to multiple other groups. Source group selects year and group; target groups are checkboxes. Creates duplicate lessons with same content for each selected target group.
- **Lesson Presentation Views:**
  - **Teacher View (Default):** List showing all lessons with lesson number, date, year/group, summary, and attention box visible. Clicking a lesson expands to show teacher notes (or "no notes" message). Action buttons: Student View (green eye), Evaluation, Edit, Delete.
  - **Student Presentation (Full-Screen Modal):** Launched via green eye icon. Shows only lesson number (large, centered), date, summary, and attention box. No logos, no year/group metadata. Clean, distraction-free design for classroom projection. Close button (X) at top-right.
- **Lesson-Scoped Self-Assessment:** "Daily Self-Assessment" is launched directly from a specific lesson summary card via an **"Avaliação / Self-Assessment"** button in the Teacher View.
- **Assessment Modal (`OralEvaluation`):** Receives `lesson_id` automatically. Fetches students enrolled in that lesson's group (`school_form_id`) and academic year (`school_year_id`), ordered by `group_number` ASC. Handles attendance (`is_attending`), student rating (1–5), teacher rating (1–5), and notes per student.
- **Evaluation Filter (`EvaluationFilter`):** Filter view over `evaluations` table showing student averages (separate student and teacher). Filters by academic year, group, student, and date range. Default sort by `group_number` ASC; reorderable by average ASC/DESC.
  - **Filters:** Group (`school_form_id`), student identity within group, lesson date range.
  - **Results:** Student name, process number, group number, student average, teacher average, evaluation count.
  - **Student Rating:** Displayed as **5-star rating system** (gold stars) instead of numbers. Clicking a star sets the rating.
  - **Teacher Rating:** Displayed as **5-star rating system** (green stars) instead of numbers. Clicking a star sets the rating.
  - **Scale labels:** 1=very_poor, 2=poor, 3=fair, 4=good, 5=excellent
- **Media Support:** Direct uploads (Supabase Storage `lesson-materials` bucket) and external links.
- **Rich Text Editing:** All text entries (summaries, attention boxes, notes) should support **bold**, *italic*, and other formatting via contenteditable or a rich text editor component.