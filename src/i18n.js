import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      "general_planning": "General Planning",
      "presentation": "Presentation/Classroom",
      "oral_evaluation": "Oral Evaluation",
      "themes": "Themes (Essential Learning)",
      "activities": "Activities",
      "manual_pages": "Manual Page(s)",
      "resources": "Resources (Physical/Digital)",
      "exercises": "Exercises (Physical/Digital)",
      "registers": "Registers",
      "school_logo": "School Logo",
      "level": "Level",
      "group": "Group",
      "subject": "Subject",
      "lesson_number": "Lesson Number",
      "date": "Date",
      "summary": "Summary",
      "attention": "Attention",
      "student_evaluation": "Student Self-Evaluation",
      "teacher_evaluation": "Teacher Evaluation",
      "very_poor": "Can Do Much Better",
      "poor": "Can Do Better",
      "fair": "Did Well",
      "good": "Did Very Well",
      "excellent": "Was Excellent"
    }
  },
  pt: {
    translation: {
      "general_planning": "Planificação Geral",
      "presentation": "Apresentação/Sala de Aula",
      "oral_evaluation": "Avaliação Oral",
      "themes": "Temas (Aprendizagens Essenciais)",
      "activities": "Atividades",
      "manual_pages": "Página(s) do Manual",
      "resources": "Recursos (Físicos/Digitais)",
      "exercises": "Exercícios (Físicos/Digitais)",
      "registers": "Registos",
      "school_logo": "Logótipo da Escola",
      "level": "Nível",
      "group": "Turma",
      "subject": "Disciplina",
      "lesson_number": "Lição nº",
      "date": "Data",
      "summary": "Sumário",
      "attention": "Atenção",
      "student_evaluation": "Auto-Avaliação do Aluno",
      "teacher_evaluation": "Avaliação do Professor",
      "very_poor": "Posso Fazer Muito Melhor",
      "poor": "Posso Fazer Melhor",
      "fair": "Fui Bom",
      "good": "Fui Muito Bom",
      "excellent": "Fui Excelente"
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // default to Portuguese
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
