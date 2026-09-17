# Project: EduPlanner (Teacher Management & Classroom App)

## Tech Stack
- Frontend: React (Vite) + Tailwind CSS + Lucide Icons + i18next (EN/PT)
- Backend: Supabase JS Client (Database + Storage Bucket `lesson-materials`)
- Hosting: GitHub Pages (Base path set to repository name)

## Key Business Logic
- **Public Presentation View:** Designed for classroom projection. Uses Logo URL: https://www.esmax.pt/images/logoaemax.png. Supports single or double lesson numbers (e.g., "Lição nº 13 e 14").
- **Oral Evaluation Module:** Side-by-side interactive sliders/stars (1–5 scale mapped to PT terms). Column A for student input, Column B for teacher verdict.
- **Media Support:** Dual handling for direct uploads (Supabase Storage) and external URLs (Drive, YouTube).
- **Hidden Teacher Drawer/Modal:** Toggleable overlay containing past/future summary list, step-by-step teacher guide, and class notes modal (Lição, Date, Sumários, Atenção, Lista).
