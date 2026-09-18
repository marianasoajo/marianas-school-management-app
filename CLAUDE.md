# Project: Professora Mariana (Teacher Management & Classroom App)

## Tech Stack
- Frontend: React (Vite) + Tailwind CSS + Lucide Icons + i18next (EN/PT)
- Backend: Supabase JS Client (Database + Storage Bucket `lesson-materials`)
- Hosting: GitHub Pages (Base path set to repository name)

## Navigation Structure
- **General Plan / Plano Geral:** Planning table (Themes, Activities, Manual Pages, Resources, Exercises, Registers).
- **Summaries / Sumários:** Presentation view for projection with full CRUD for class summaries (lessons) assigned to specific school years & groups, plus filtering by Year, Group, and Date. Includes step-by-step guides and hidden teacher notes modal.
- **Daily selfassessment / Autoavaliação Diária:** Attendance toggle (`is_attending`) and side-by-side student/teacher rating sliders.
- **Groups / Turmas:** CRUD management for Academic Years (`school_years`) and Classes/Forms (`school_forms`).
- **Students / Alunos:** Student CRUD, year/group enrollment assignment modals, and guardian management modals.

## Key Business Logic
- **Summaries & Class Management:** Complete CRUD interface to create, edit, and delete class records (`lessons`). Mandatory filtering toolbar at the top to select Academic Year (`school_year_id`), Group/Turma (`school_form_id`), and/or Class Date.
- **Public Presentation View:** School logo header (`https://www.esmax.pt/images/logoaemax.png`). Supports single and double lesson numbers (e.g., "Lição nº 13 e 14").
- **Oral Evaluation Module:** Attendance check disables sliders if absent. Interactive 1–5 scale mapped to Portuguese terms (*Posso Fazer Muito Melhor* to *Fui Muito Bom*).
- **Student & Group Management:** Full CRUD for student records with modals to enroll students into specific school years/groups (`student_enrollments`) and attach guardian information (`guardians` & `student_guardians`).
- **Media Support:** Direct photo/file uploads (Supabase Storage `lesson-materials` bucket) alongside external web links.
- **Hidden Teacher Overlay:** Toggleable drawer for editing summaries, class notes (*Lição*, *Date*, *Sumários*, *Atenção*, *Lista*), and step-by-step guides.
