import { supabase } from '../lib/supabase'

export const studentService = {
    async getStudents({ yearId, formId, searchQuery } = {}) {
        let query = supabase
            .from('students')
            .select(`
        *,
        student_enrolments (
          id,
          group_number,
          school_year_id,
          school_form_id,
          school_years (id, label),
          school_forms (id, year_level, class_section)
        ),
        student_guardians (
          relationship,
          guardian:guardians (id, name, phone_number, email)
        )
      `)
            .order('name', { ascending: true })

        if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,process_number.ilike.%${searchQuery}%`)
        }

        const { data, error } = await query
        if (error) throw error

        // Filter enrolments locally if yearId or formId provided
        if (!yearId && !formId) return data

        return data.filter(student =>
            student.student_enrolments?.some(e =>
                (!yearId || e.school_year_id === yearId) &&
                (!formId || e.school_form_id === formId)
            )
        )
    },

    async getStudentsByGroup(yearId, formId) {
        const { data, error } = await supabase
            .from('student_enrolments')
            .select(`
        id,
        group_number,
        student:students (
          id,
          process_number,
          name,
          birthdate,
          photo_url
        )
      `)
            .eq('school_year_id', yearId)
            .eq('school_form_id', formId)
            .order('group_number', { ascending: true })

        if (error) throw error
        return data.map(item => ({
            enrolment_id: item.id,
            group_number: item.group_number,
            ...item.student
        }))
    },

    async createStudentWithEnrolment({ studentData, yearId, formId, groupNumber, guardianData }) {
        // 1. Insert Student
        const { data: student, error: studentError } = await supabase
            .from('students')
            .insert([studentData])
            .select()
            .single()

        if (studentError) throw studentError

        // 2. Insert Enrolment
        if (yearId && formId) {
            const { error: enrolError } = await supabase
                .from('student_enrolments')
                .insert([{
                    student_id: student.id,
                    school_year_id: yearId,
                    school_form_id: formId,
                    group_number: groupNumber ? parseInt(groupNumber, 10) : null
                }])

            if (enrolError) throw enrolError
        }

        // 3. Optional Guardian Link
        if (guardianData?.name) {
            const { data: guardian, error: guardianError } = await supabase
                .from('guardians')
                .insert([{
                    name: guardianData.name,
                    phone_number: guardianData.phone_number || null,
                    email: guardianData.email || null
                }])
                .select()
                .single()

            if (!guardianError && guardian) {
                await supabase.from('student_guardians').insert([{
                    student_id: student.id,
                    guardian_id: guardian.id,
                    relationship: guardianData.relationship || 'Encarregado de Educação'
                }])
            }
        }

        return student
    },

    async updateStudent(id, studentData) {
        const { data, error } = await supabase
            .from('students')
            .update(studentData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteStudent(id) {
        const { error } = await supabase.from('students').delete().eq('id', id)
        if (error) throw error
    },

    async bulkImportStudents({ students, yearId, formId }) {
        const results = { success: 0, failed: 0, errors: [] }

        for (const row of students) {
            try {
                await this.createStudentWithEnrolment({
                    studentData: {
                        process_number: String(row.process_number),
                        name: row.name,
                        birthdate: row.birthdate || null,
                    },
                    yearId,
                    formId,
                    groupNumber: row.group_number,
                    guardianData: row.guardian_name ? {
                        name: row.guardian_name,
                        phone_number: row.guardian_phone,
                        email: row.guardian_email,
                        relationship: row.guardian_relationship
                    } : null
                })
                results.success++
            } catch (err) {
                results.failed++
                results.errors.push({ name: row.name, message: err.message })
            }
        }

        return results
    },

    async exportOrPromoteStudents({ studentIds, targetYearId, targetFormId, preserveNumbers }) {
        const enrolmentsToInsert = studentIds.map((studentId, idx) => ({
            student_id: studentId,
            school_year_id: targetYearId,
            school_form_id: targetFormId,
            group_number: preserveNumbers ? idx + 1 : null
        }))

        const { data, error } = await supabase
            .from('student_enrolments')
            .upsert(enrolmentsToInsert, { onConflict: 'student_id,school_year_id' })
            .select()

        if (error) throw error
        return data
    }
}