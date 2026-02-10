import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/calendar'
import { Info } from 'lucide-react'
import type { User, CreateUserData } from '@/lib/users'

const DAYS_OF_WEEK = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

interface UserFormProps {
    user?: User
    onSubmit: (data: CreateUserData) => void
    onCancel: () => void
    isLoading?: boolean
}

export function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
    const [formData, setFormData] = useState<CreateUserData>({
        name: user?.name || '',
        user_name: user?.user_name || '',
        phone: user?.phone || '',
        whatsapp_number: user?.whatsapp_number || '',
        email: user?.email || '',
        blood_group: user?.blood_group || 'O+',
        height_cm: user?.height_cm || 0,
        weight_kg: user?.weight_kg || 0,
        joined_at: user?.joined_at || '',
        end_date: user?.end_date || '',
        availability_days: user?.availability_days || [],
        send_absence_reminders: user?.send_absence_reminders ?? false,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const toggleDay = (day: string) => {
        setFormData((prev) => ({
            ...prev,
            availability_days: prev.availability_days.includes(day)
                ? prev.availability_days.filter((d) => d !== day)
                : [...prev.availability_days, day],
        }))
    }

    const parseDate = (dateString: string): Date | undefined => {
        if (!dateString) return undefined
        return new Date(dateString)
    }

    const formatDateForInput = (date: Date | undefined): string => {
        if (!date) return ''
        return date.toISOString().split('T')[0]
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    {/* User Name */}
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="user_name">User Name *</Label>
                        <Input
                            id="user_name"
                            value={formData.user_name}
                            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                            placeholder="Enter user name"
                            required
                        />
                        {user && (
                            <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Info className="h-3.5 w-3.5 shrink-0" />
                                Changing this will affect Zoom tracking for this user.
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1234567890"
                            required
                        />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                        <Input
                            id="whatsapp"
                            value={formData.whatsapp_number}
                            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                            placeholder="+1234567890"
                            required
                        />
                    </div>

                    {/* Blood Group */}
                    <div className="space-y-2">
                        <Label htmlFor="blood_group">Blood Group *</Label>
                        <Select
                            value={formData.blood_group}
                            onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent>
                                {BLOOD_GROUPS.map((bg) => (
                                    <SelectItem key={bg} value={bg}>
                                        {bg}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Physical Information Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Physical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Height */}
                    <div className="space-y-2">
                        <Label htmlFor="height">Height (cm) *</Label>
                        <Input
                            id="height"
                            type="number"
                            step="0.01"
                            value={formData.height_cm || ''}
                            onChange={(e) => setFormData({ ...formData, height_cm: parseFloat(e.target.value) || 0 })}
                            placeholder="175"
                            required
                        />
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg) *</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            value={formData.weight_kg || ''}
                            onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 })}
                            placeholder="70.5"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Membership Information Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Membership Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Joined Date */}
                    <div className="space-y-2">
                        <Label>Joined Date *</Label>
                        <DatePicker
                            date={parseDate(formData.joined_at)}
                            onDateChange={(date) =>
                                setFormData({ ...formData, joined_at: formatDateForInput(date) })
                            }
                            placeholder="Select join date"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <Label>Membership End Date *</Label>
                        <DatePicker
                            date={parseDate(formData.end_date)}
                            onDateChange={(date) =>
                                setFormData({ ...formData, end_date: formatDateForInput(date) })
                            }
                            placeholder="Select end date"
                        />
                    </div>
                </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Availability
                </h3>
                <div className="space-y-2">
                    <Label>Available Days *</Label>
                    <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.availability_days.includes(day)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                            </button>
                        ))}
                    </div>
                    {formData.availability_days.length === 0 && (
                        <p className="text-sm text-slate-500">Please select at least one day</p>
                    )}
                </div>
            </div>

            {/* Notifications Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Notifications
                </h3>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="send_absence_reminders"
                        checked={formData.send_absence_reminders}
                        onCheckedChange={(checked) =>
                            setFormData({ ...formData, send_absence_reminders: checked as boolean })
                        }
                    />
                    <label
                        htmlFor="send_absence_reminders"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Send Absence Reminders
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || formData.availability_days.length === 0}>
                    {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    )
}
