import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/calendar'
import { TimePicker } from '@/components/ui/time-picker'
import type { FitnessSession, CreateSessionData } from '@/lib/fitness-sessions'

interface SessionFormProps {
    session?: FitnessSession
    onSubmit: (data: CreateSessionData) => void
    onCancel: () => void
    isLoading?: boolean
}

export function SessionForm({ session, onSubmit, onCancel, isLoading }: SessionFormProps) {
    const [formData, setFormData] = useState<CreateSessionData>({
        title: session?.title || '',
        date: session?.date ? format(new Date(session.date), 'yyyy-MM-dd') : '',
        start_time: session?.start_time ? format(new Date(session.start_time), 'HH:mm') : '09:00',
        end_time: session?.end_time ? format(new Date(session.end_time), 'HH:mm') : '10:00',
    })

    useEffect(() => {
        if (session) {
            setFormData({
                title: session.title || '',
                date: session.date ? format(new Date(session.date), 'yyyy-MM-dd') : '',
                start_time: session.start_time ? format(new Date(session.start_time), 'HH:mm') : '09:00',
                end_time: session.end_time ? format(new Date(session.end_time), 'HH:mm') : '10:00',
            })
        }
    }, [session])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const parseDate = (dateString: string): Date | undefined => {
        if (!dateString) return undefined
        // Parse "YYYY-MM-DD" as local midnight
        const [year, month, day] = dateString.split('-').map(Number)
        // Check if parsing resulted in valid numbers
        if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined
        const date = new Date(year, month - 1, day)
        // Check if date is valid
        if (isNaN(date.getTime())) return undefined
        return date
    }

    const formatDateForInput = (date: Date | undefined): string => {
        if (!date) return ''
        return format(date, 'yyyy-MM-dd')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Details Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Session Details
                </h3>
                <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Session Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Morning Yoga Session"
                            required
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label>Session Date *</Label>
                        <DatePicker
                            date={parseDate(formData.date)}
                            onDateChange={(date) =>
                                setFormData({ ...formData, date: formatDateForInput(date) })
                            }
                            placeholder="Select session date"
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time *</Label>
                            <TimePicker
                                value={formData.start_time}
                                onChange={(time) => setFormData({ ...formData, start_time: time })}
                                placeholder="Select start time"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Time *</Label>
                            <TimePicker
                                value={formData.end_time}
                                onChange={(time) => setFormData({ ...formData, end_time: time })}
                                placeholder="Select end time"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
                </Button>
            </div>
        </form>
    )
}
