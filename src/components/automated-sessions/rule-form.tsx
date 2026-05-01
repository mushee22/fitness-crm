import { useEffect, useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { AutomatedSessionRule, CreateAutomatedSessionRuleData } from '@/lib/automated-sessions'
import { istTimeToUtcHHmm, utcTimeToIstHHmm } from '@/lib/utils'

interface AutomatedSessionRuleFormProps {
    rule?: AutomatedSessionRule
    onSubmit: (data: CreateAutomatedSessionRuleData | Partial<CreateAutomatedSessionRuleData>) => void
    onCancel: () => void
    isLoading?: boolean
    apiErrors?: Record<string, string>
}

interface LocalErrors {
    title?: string
    start_time?: string
    end_time?: string
    starts_on?: string
    ends_on?: string
}

const toInputDate = (value: string | null | undefined): string => {
    if (!value) return ''
    return value.slice(0, 10)
}

const toMinutes = (value: string): number | null => {
    if (!value) return null
    const [h, m] = value.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return h * 60 + m
}

export function AutomatedSessionRuleForm({
    rule,
    onSubmit,
    onCancel,
    isLoading,
    apiErrors,
}: AutomatedSessionRuleFormProps) {
    const [formData, setFormData] = useState<CreateAutomatedSessionRuleData>({
        title: rule?.title ?? '',
        start_time: utcTimeToIstHHmm(rule?.start_time) || '06:00',
        end_time: utcTimeToIstHHmm(rule?.end_time) || '07:00',
        starts_on: toInputDate(rule?.starts_on),
        ends_on: toInputDate(rule?.ends_on) || null,
        is_active: rule?.is_active ?? true,
    })
    const [localErrors, setLocalErrors] = useState<LocalErrors>({})

    useEffect(() => {
        setFormData({
            title: rule?.title ?? '',
            start_time: utcTimeToIstHHmm(rule?.start_time) || '06:00',
            end_time: utcTimeToIstHHmm(rule?.end_time) || '07:00',
            starts_on: toInputDate(rule?.starts_on),
            ends_on: toInputDate(rule?.ends_on) || null,
            is_active: rule?.is_active ?? true,
        })
        setLocalErrors({})
    }, [rule])

    const normalizedErrors = useMemo(
        () => ({
            ...localErrors,
            ...apiErrors,
        }),
        [localErrors, apiErrors]
    )

    const validate = () => {
        const errors: LocalErrors = {}
        const startMinutes = toMinutes(formData.start_time)
        const endMinutes = toMinutes(formData.end_time)

        if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
            errors.end_time = 'End time must be after start time.'
        }

        if (formData.ends_on && formData.starts_on && formData.ends_on < formData.starts_on) {
            errors.ends_on = 'End date must be the same as or after start date.'
        }

        setLocalErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        const payload = {
            ...formData,
            start_time: istTimeToUtcHHmm(formData.start_time),
            end_time: istTimeToUtcHHmm(formData.end_time),
            ends_on: formData.ends_on || null,
        }
        onSubmit(payload)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="rule-title">Title *</Label>
                <Input
                    id="rule-title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Morning Yoga"
                    required
                />
                {normalizedErrors.title && <p className="text-xs text-red-600">{normalizedErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rule-start-time">Start Time *</Label>
                    <Input
                        id="rule-start-time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                        required
                    />
                    {normalizedErrors.start_time && <p className="text-xs text-red-600">{normalizedErrors.start_time}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rule-end-time">End Time *</Label>
                    <Input
                        id="rule-end-time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                        required
                    />
                    {normalizedErrors.end_time && <p className="text-xs text-red-600">{normalizedErrors.end_time}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rule-starts-on">Starts On *</Label>
                    <Input
                        id="rule-starts-on"
                        type="date"
                        value={formData.starts_on}
                        onChange={(e) => setFormData((prev) => ({ ...prev, starts_on: e.target.value }))}
                        required
                    />
                    {normalizedErrors.starts_on && <p className="text-xs text-red-600">{normalizedErrors.starts_on}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rule-ends-on">Ends On</Label>
                    <Input
                        id="rule-ends-on"
                        type="date"
                        value={formData.ends_on ?? ''}
                        min={formData.starts_on || undefined}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                ends_on: e.target.value || null,
                            }))
                        }
                    />
                    {normalizedErrors.ends_on && <p className="text-xs text-red-600">{normalizedErrors.ends_on}</p>}
                </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <div>
                    <p className="text-sm font-medium text-slate-900">Rule Active</p>
                    <p className="text-xs text-slate-500">Paused rules stop generating future sessions.</p>
                </div>
                <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : rule ? 'Update Rule' : 'Create Rule'}
                </Button>
            </div>
        </form>
    )
}
