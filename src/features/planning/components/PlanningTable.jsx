import { ArrowRightCircle, Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import ConfirmDeletionModal from '../../../components/ui/ConfirmDeletionModal'
import IconButton from '../../../components/ui/IconButton'
import { useGroupsManager } from '../../groups/hooks/useGroupsManager'
import { usePlanning } from '../hooks/usePlanning'
import CreateThemeModal from './CreateThemeModal'
import ExportToLessonModal from './ExportToLessonModal'
import PlanningFilterBar from './PlanningFilterBar'

export default function PlanningTable() {
    const { t } = useTranslation()
    const { years, forms } = useGroupsManager()

    const [selectedYear, setSelectedYear] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingUnit, setEditingUnit] = useState(null)
    const [exportUnit, setExportUnit] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    const { planningUnits, loading, error, createUnit, updateUnit, deleteUnit, exportToLesson } = usePlanning(selectedYear)

    const filteredUnits = planningUnits.filter(u =>
        u.theme.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSaveUnit = async (formData, formIds) => {
        if (editingUnit) {
            await updateUnit(editingUnit.id, formData, formIds)
        } else {
            await createUnit(formData, formIds)
        }
    }

    const handleConfirmDelete = async () => {
        if (deletingId) {
            await deleteUnit(deletingId)
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-4">
            <PlanningFilterBar
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenCreateModal={() => {
                    setEditingUnit(null)
                    setIsCreateOpen(true)
                }}
            />

            {loading ? (
                <div className="py-12 text-center text-content-muted animate-pulse">
                    {t('loading')}
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl text-center text-sm">
                    {error}
                </div>
            ) : filteredUnits.length === 0 ? (
                <div className="py-12 text-center text-content-muted border border-dashed border-app-border rounded-xl">
                    {t('no_units')}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredUnits.map((unit) => {
                        const assignedForms = unit.planning_unit_forms?.map(f => f.school_forms).filter(Boolean) || []

                        return (
                            <Card key={unit.id} className="p-4 transition-all hover:border-brand-primary/40">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-lg text-content-main">{unit.theme}</h3>
                                            {assignedForms.map(f => (
                                                <Badge key={f.id} variant="primary">
                                                    {f.year_level} {f.class_section}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-content-muted pt-2 border-t border-app-border/60">
                                            {unit.activities && (
                                                <div>
                                                    <strong className="text-content-main">{t('activities')}:</strong>
                                                    <div dangerouslySetInnerHTML={{ __html: unit.activities }} className="line-clamp-2" />
                                                </div>
                                            )}
                                            {unit.manual_pages && (
                                                <div>
                                                    <strong className="text-content-main">{t('manual_pages')}:</strong> {unit.manual_pages}
                                                </div>
                                            )}
                                            {(unit.resources_physical || unit.resources_digital) && (
                                                <div>
                                                    <strong className="text-content-main">{t('resources')}:</strong> {unit.resources_physical} / {unit.resources_digital}
                                                </div>
                                            )}
                                            {(unit.exercises_physical || unit.exercises_digital) && (
                                                <div>
                                                    <strong className="text-content-main">{t('exercises')}:</strong> {unit.exercises_physical} / {unit.exercises_digital}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-app-border">
                                        <IconButton
                                            variant="ghost"
                                            onClick={() => setExportUnit(unit)}
                                            title="Exportar para Lição"
                                            className="text-brand-primary hover:bg-brand-primary-light"
                                        >
                                            <ArrowRightCircle className="w-5 h-5" />
                                        </IconButton>

                                        <IconButton
                                            variant="ghost"
                                            onClick={() => {
                                                setEditingUnit(unit)
                                                setIsCreateOpen(true)
                                            }}
                                            title={t('edit_theme')}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </IconButton>

                                        <IconButton
                                            variant="ghost"
                                            onClick={() => setDeletingId(unit.id)}
                                            title={t('delete_theme')}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </IconButton>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Modals */}
            {isCreateOpen && (
                <CreateThemeModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSave={handleSaveUnit}
                    unit={editingUnit}
                    years={years}
                    forms={forms}
                    initialYearId={selectedYear}
                />
            )}

            {exportUnit && (
                <ExportToLessonModal
                    isOpen={Boolean(exportUnit)}
                    onClose={() => setExportUnit(null)}
                    unit={exportUnit}
                    years={years}
                    forms={forms}
                    onExport={exportToLesson}
                />
            )}

            {deletingId && (
                <ConfirmDeletionModal
                    isOpen={Boolean(deletingId)}
                    onClose={() => setDeletingId(null)}
                    onConfirm={handleConfirmDelete}
                    message={t('confirm_delete_theme')}
                />
            )}
        </div>
    )
}