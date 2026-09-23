import { supabase } from '../../../lib/supabase'

export const fetchMetadata = async () => {
    const [yearsRes, formsRes] = await Promise.all([
        supabase.from('school_years').select('*').order('label', { ascending: false }),
        supabase.from('school_forms').select('*').order('year_level, class_section')
    ])

    if (yearsRes.error) throw yearsRes.error
    if (formsRes.error) throw formsRes.error

    return {
        schoolYears: yearsRes.data || [],
        schoolForms: formsRes.data || []
    }
}

export const fetchStudents = async ({ filterYearId, filterFormId, searchQuery }) => {
    const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
      *,
      student_enrolments (
        id,
        school_year_id,
        school_form_id,
        group_number,
        school_years (label),
        school_forms (year_level, class_section)
      )
    `)
        .order('name')

    if (studentsError) throw studentsError

    const { data: guardiansData, error: guardiansError } = await supabase
        .from('student_guardians')
        .select(`
      student_id,
      relationship,
      guardians (id, name, phone_number, email)
    `)

    if (guardiansError) throw guardiansError

    const guardiansMap = {}
    guardiansData?.forEach((sg) => {
        if (!guardiansMap[sg.student_id]) {
            guardiansMap[sg.student_id] = []
        }
        if (sg.guardians) {
            guardiansMap[sg.student_id].push({
                ...sg.guardians,
                relationship: sg.relationship
            })
        }
    })

    let combined = (studentsData || []).map((student) => ({
        ...student,
        guardians: guardiansMap[student.id] || [],
        currentEnrolment: student.student_enrolments?.[0] || null
    }))

    if (filterYearId) {
        combined = combined.filter((s) =>
            s.student_enrolments?.some((e) => e.school_year_id === filterYearId)
        )
    }

    if (filterFormId) {
        combined = combined.filter((s) =>
            s.student_enrolments?.some((e) => e.school_form_id === filterFormId)
        )
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase()
        combined = combined.filter(
            (s) =>
                s.name?.toLowerCase().includes(query) ||
                s.process_number?.toLowerCase().includes(query)
        )
    }

    return combined
}

export const saveStudent = async (studentForm, editingStudent = null) => {
    let studentId

    if (editingStudent) {
        studentId = editingStudent.id
        const { error: updateError } = await supabase
            .from('students')
            .update({
                process_number: studentForm.process_number,
                name: studentForm.name,
                birthdate: studentForm.birthdate || null
            })
            .eq('id', studentId)

        if (updateError) throw updateError
    } else {
        const { data: newStudent, error: insertError } = await supabase
            .from('students')
            .insert({
                process_number: studentForm.process_number,
                name: studentForm.name,
                birthdate: studentForm.birthdate || null
            })
            .select()
            .single()

        if (insertError) throw insertError
        studentId = newStudent.id
    }

    if (studentForm.school_year_id && studentForm.school_form_id) {
        const { error: enrolmentError } = await supabase
            .from('student_enrolments')
            .upsert(
                {
                    student_id: studentId,
                    school_year_id: studentForm.school_year_id,
                    school_form_id: studentForm.school_form_id,
                    group_number: Number(studentForm.group_number)
                },
                { onConflict: 'student_id,school_year_id' }
            )

        if (enrolmentError) throw enrolmentError
    }

    if (studentForm.guardian_name?.trim()) {
        const { data: existingGuardian } = await supabase
            .from('guardians')
            .select('id')
            .eq('name', studentForm.guardian_name.trim())
            .eq('phone_number', studentForm.guardian_phone?.trim() || '')
            .maybeSingle()

        let guardianId = existingGuardian?.id

        if (!guardianId) {
            const { data: newGuardian, error: guardianError } = await supabase
                .from('guardians')
                .insert({
                    name: studentForm.guardian_name.trim(),
                    phone_number: studentForm.guardian_phone?.trim() || null,
                    email: studentForm.guardian_email?.trim() || null
                })
                .select()
                .single()

            if (!guardianError && newGuardian) {
                guardianId = newGuardian.id
            }
        }

        if (guardianId) {
            await supabase
                .from('student_guardians')
                .upsert(
                    {
                        student_id: studentId,
                        guardian_id: guardianId,
                        relationship: studentForm.guardian_relationship
                    },
                    { onConflict: 'student_id,guardian_id' }
                )
        }
    }

    return studentId
}

export const deleteStudent = async (studentId) => {
    const { error } = await supabase.from('students').delete().eq('id', studentId)
    if (error) throw error
}

export const saveEnrolment = async (studentId, enrolmentForm) => {
    const { error } = await supabase
        .from('student_enrolments')
        .upsert(
            {
                student_id: studentId,
                school_year_id: enrolmentForm.school_year_id,
                school_form_id: enrolmentForm.school_form_id
            },
            { onConflict: 'student_id,school_year_id' }
        )
    if (error) throw error
}

export const addGuardian = async (studentId, guardianForm) => {
    const { data: newGuardian, error: insertError } = await supabase
        .from('guardians')
        .insert({
            name: guardianForm.name.trim(),
            phone_number: guardianForm.phone_number.trim() || null,
            email: guardianForm.email.trim() || null
        })
        .select()
        .single()

    if (insertError) throw insertError

    const { error: linkError } = await supabase
        .from('student_guardians')
        .insert({
            student_id: studentId,
            guardian_id: newGuardian.id,
            relationship: guardianForm.relationship
        })

    if (linkError) throw linkError
}

export const detachGuardian = async (studentId, guardianId) => {
    const { error } = await supabase
        .from('student_guardians')
        .delete()
        .eq('student_id', studentId)
        .eq('guardian_id', guardianId)

    if (error) throw error
}