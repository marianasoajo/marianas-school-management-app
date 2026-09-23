import * as XLSX from 'xlsx'

export const normalizeKey = (key) => {
    return key
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
}

export const parseRawObjects = (rawObjects) => {
    return rawObjects.map((item, index) => {
        const normalizedItem = {}
        Object.keys(item).forEach((k) => {
            normalizedItem[normalizeKey(k)] = String(item[k] ?? '').trim()
        })

        const process_number =
            normalizedItem.process_number ||
            normalizedItem.processo ||
            normalizedItem.n_processo ||
            normalizedItem.nr_processo ||
            normalizedItem.numero ||
            normalizedItem.id ||
            ''

        const name =
            normalizedItem.name ||
            normalizedItem.nome ||
            normalizedItem.student_name ||
            normalizedItem.nome_completo ||
            normalizedItem.aluno ||
            ''

        let birthdate =
            normalizedItem.birthdate ||
            normalizedItem.data_nasc ||
            normalizedItem.data_nascimento ||
            normalizedItem.nascimento ||
            normalizedItem.birth_date ||
            ''

        if (birthdate && birthdate.includes('/')) {
            const parts = birthdate.split('/')
            if (parts.length === 3 && parts[2].length === 4) {
                birthdate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
            }
        }

        const group_number =
            normalizedItem.group_number ||
            normalizedItem.group_no ||
            normalizedItem.numero_grupo ||
            normalizedItem.numero_aluno ||
            normalizedItem.no ||
            ''

        const guardian_name =
            normalizedItem.guardian_name ||
            normalizedItem.encarregado ||
            normalizedItem.nome_encarregado ||
            normalizedItem.ee ||
            normalizedItem.encarregado_educacao ||
            ''

        const guardian_phone =
            normalizedItem.guardian_phone ||
            normalizedItem.telefone ||
            normalizedItem.telemovel ||
            normalizedItem.telefone_encarregado ||
            normalizedItem.contacto ||
            ''

        const guardian_email =
            normalizedItem.guardian_email ||
            normalizedItem.email ||
            normalizedItem.email_encarregado ||
            ''

        const guardian_relationship =
            normalizedItem.relationship ||
            normalizedItem.parentesco ||
            normalizedItem.relacao ||
            'mother'

        const isValid = Boolean(
            process_number &&
            name &&
            group_number &&
            Number.isInteger(Number(group_number))
        )

        return {
            id: index + 1,
            process_number,
            name,
            birthdate,
            group_number,
            guardian_name,
            guardian_phone,
            guardian_email,
            guardian_relationship,
            isValid,
            errors: [
                !process_number ? 'Processo em falta' : null,
                !name ? 'Nome em falta' : null,
                !group_number ? 'Número de grupo em falta' : null,
                group_number && !Number.isInteger(Number(group_number)) ? 'Número de grupo inválido' : null
            ].filter(Boolean)
        }
    })
}

// Ensure this named export exists
export const parseExcelOrCsv = (data, isArrayBuffer = false) => {
    const workbook = isArrayBuffer
        ? XLSX.read(new Uint8Array(data), { type: 'array' })
        : XLSX.read(data, { type: 'string' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(firstSheet)
    return parseRawObjects(json)
}