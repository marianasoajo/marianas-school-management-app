import { Calendar, Mail, Pencil, Phone, User, Users, X } from 'lucide-react'

export function StudentDetailsModal({ isOpen, onClose, student, onEditStudent, t }) {
    if (!isOpen || !student) return null

    const currentEnrolment = student.currentEnrolment

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <User size={18} className="text-blue-600 dark:text-blue-400" />
                        {t('student_details') || 'Detalhes do Aluno'}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                onClose()
                                onEditStudent(student)
                            }}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title={t('edit_student') || 'Editar Aluno'}
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Student Basic Info & Photo */}
                    <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                            {/* Student Photo Avatar */}
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 shrink-0 flex items-center justify-center shadow-sm">
                                {student.photo_url ? (
                                    <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={30} className="text-gray-400" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {student.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('process_number')}: <span className="font-mono text-gray-800 dark:text-gray-200">{student.process_number}</span>
                                </div>
                            </div>
                        </div>

                        {/* Academic Details */}
                        <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-lg border border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <div>
                                <span className="font-medium text-gray-500">{t('group_number') || 'N.º Turma'}:</span>{' '}
                                <span className="text-gray-900 dark:text-gray-200 font-semibold">{currentEnrolment?.group_number || '—'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="font-medium text-gray-500">{t('current_group')}:</span>{' '}
                                <span className="text-gray-900 dark:text-gray-200 font-medium">
                                    {currentEnrolment
                                        ? `${currentEnrolment.school_forms?.year_level} ${currentEnrolment.school_forms?.class_section} (${currentEnrolment.school_years?.label})`
                                        : '—'}
                                </span>
                            </div>
                            <div className="col-span-2 flex items-center gap-1 mt-1">
                                <Calendar size={13} className="text-gray-400" />
                                <span className="font-medium text-gray-500">{t('birthdate')}:</span>{' '}
                                <span className="text-gray-900 dark:text-gray-200">
                                    {student.birthdate ? new Date(student.birthdate).toLocaleDateString() : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Guardian Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users size={14} />
                            {t('guardians') || 'Encarregados de Educação'}
                        </h3>

                        {(!student.guardians || student.guardians.length === 0) ? (
                            <p className="text-xs text-gray-500 italic bg-gray-50 dark:bg-gray-800/20 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                                {t('no_guardians') || 'Nenhum encarregado de educação associado.'}
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                {student.guardians.map((g, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-800 space-y-1.5 text-xs"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-900 dark:text-gray-100">{g.name}</span>
                                            {g.relationship && (
                                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-semibold capitalize">
                                                    {g.relationship}
                                                </span>
                                            )}
                                        </div>

                                        {g.phone_number && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <Phone size={12} className="text-gray-400" />
                                                <span>{g.phone_number}</span>
                                            </div>
                                        )}

                                        {g.email && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <Mail size={12} className="text-gray-400" />
                                                <span>{g.email}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center">
                    <button
                        onClick={() => {
                            onClose()
                            onEditStudent(student)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        <Pencil size={14} />
                        <span>{t('edit_student') || 'Editar Aluno'}</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        {t('close') || 'Fechar'}
                    </button>
                </div>
            </div>
        </div>
    )
}