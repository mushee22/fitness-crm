import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/calendar'
import { TimePicker } from '@/components/ui/time-picker'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import type { FitnessSession, CreateSessionData } from '@/lib/fitness-sessions'
import { usersService } from '@/lib/users'

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
        filter_by_availability: session?.filter_by_availability ?? true,
        user_ids: session?.user_ids || [],
    })

    useEffect(() => {
        if (session) {
            setFormData({
                title: session.title || '',
                date: session.date ? format(new Date(session.date), 'yyyy-MM-dd') : '',
                start_time: session.start_time ? format(new Date(session.start_time), 'HH:mm') : '09:00',
                end_time: session.end_time ? format(new Date(session.end_time), 'HH:mm') : '10:00',
                filter_by_availability: session.filter_by_availability ?? true,
                user_ids: session.user_ids || [],
            })
        }
    }, [session])

    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ['users', 1],
        queryFn: () => usersService.getUsers(1, 100),
    })

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

    const toggleUser = (userId: number) => {
        setFormData((prev) => ({
            ...prev,
            user_ids: prev.user_ids.includes(userId)
                ? prev.user_ids.filter((id) => id !== userId)
                : [...prev.user_ids, userId],
        }))
    }

    const selectAllUsers = () => {
        if (!usersData?.data) return
        setFormData((prev) => ({
            ...prev,
            user_ids: usersData.data.map((u) => u.id),
        }))
    }

    const clearAllUsers = () => {
        setFormData((prev) => ({
            ...prev,
            user_ids: [],
        }))
    }

    // Filter users by availability if enabled
    const availableUsers = formData.filter_by_availability && formData.date
        ? usersData?.data.filter((user) => {
            const sessionDate = new Date(formData.date)
            const dayName = sessionDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
            return user.availability_days.includes(dayName)
        })
        : usersData?.data

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

            {/* Participants Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Participants
                    </h3>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter" className="text-xs text-slate-600">
                            Filter by availability
                        </Label>
                        <Switch
                            id="filter"
                            checked={formData.filter_by_availability}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, filter_by_availability: checked })
                            }
                        />
                    </div>
                </div>

                {loadingUsers ? (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-12 bg-slate-100" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 mb-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={selectAllUsers}
                            >
                                Select All
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearAllUsers}
                            >
                                Clear All
                            </Button>
                            <div className="ml-auto text-sm text-slate-600">
                                {formData.user_ids.length} selected
                            </div>
                        </div>

                        {formData.filter_by_availability && !formData.date && (
                            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                                Select a date to filter users by availability
                            </p>
                        )}

                        <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                            {availableUsers && availableUsers.length > 0 ? (
                                <div className="divide-y divide-slate-200">
                                    {availableUsers.map((user) => (
                                        <label
                                            key={user.id}
                                            className="flex items-center gap-3 p-4 hover:bg-blue-50/50 cursor-pointer transition-all group"
                                        >
                                            <Checkbox
                                                checked={formData.user_ids.includes(user.id)}
                                                onCheckedChange={() => toggleUser(user.id)}
                                            />
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 group-hover:scale-105 transition-transform">
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className="text-xs font-medium border-slate-300">
                                                    {user.blood_group}
                                                </Badge>
                                                {formData.user_ids.includes(user.id) && (
                                                    <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <div className="h-16 w-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                                        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="font-medium text-sm">
                                        {formData.filter_by_availability && formData.date
                                            ? 'No users available on this day'
                                            : 'No users found'}
                                    </p>
                                    <p className="text-xs mt-1">
                                        {formData.filter_by_availability && formData.date
                                            ? 'Try selecting a different date or disable availability filter'
                                            : 'Add users to get started'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
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
                    disabled={isLoading || formData.user_ids.length === 0}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
                </Button>
            </div>
        </form>
    )
}
