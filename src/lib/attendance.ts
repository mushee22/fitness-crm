import { api } from './api'
import { type FitnessSession } from './fitness-sessions'
import { type User } from './users'

export interface Attendance {
    id: number
    user_id: number
    fitness_session_id: number
    join_token?: string
    zoom_participant_id?: string
    joined_at: string | null
    left_at: string | null
    total_minutes_attended: number
    attended_fully: boolean
    early_exit: boolean
    zoom_metadata?: any
    user?: User
    fitness_session?: FitnessSession
    created_at: string
    updated_at: string
}

export interface AttendanceFilters {
    user_id?: string
    fitness_session_id?: string
    date_from?: string
    date_to?: string
    attended_fully?: boolean
    early_exit?: boolean
    page?: number
    per_page?: number
}

export interface AttendanceListResponse {
    data: Attendance[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface UserAttendanceStats {
    user_id: number
    user_name: string
    statistics: {
        total_sessions_attended: number
        fully_attended_sessions: number
        early_exit_sessions: number
        early_exit_percentage: number
        average_attendance_duration: number
        total_minutes_attended: number
    }
}

export interface SessionAttendanceStats {
    total_users: number
    attended_count: number
    attendance_rate: number
    fully_attended_count: number
    early_exit_count: number
}

export interface InactiveUser {
    id: number
    name: string
    user_name: string
    phone: string
    whatsapp_number: string | null
    email: string
    consecutive_missed_days: number
    last_attended_at: string | null
    send_absence_reminders: boolean
}

export interface InactiveUsersResponse {
    days: number
    total: number
    users: InactiveUser[]
}

export const attendanceService = {
    async getAttendances(filters: AttendanceFilters = {}): Promise<AttendanceListResponse> {
        const params = new URLSearchParams()

        if (filters.user_id) params.append('user_id', filters.user_id)
        if (filters.fitness_session_id) params.append('fitness_session_id', filters.fitness_session_id)
        if (filters.date_from) params.append('date_from', filters.date_from)
        if (filters.date_to) params.append('date_to', filters.date_to)
        if (filters.attended_fully !== undefined) params.append('attended_fully', String(filters.attended_fully))
        if (filters.early_exit !== undefined) params.append('early_exit', String(filters.early_exit))
        if (filters.page) params.append('page', String(filters.page))
        if (filters.per_page) params.append('per_page', String(filters.per_page))

        const response = await api.get(`attendances?${params.toString()}`)
        return response.data
    },

    async getAttendance(id: number): Promise<{ data: Attendance }> {
        const response = await api.get(`attendances/${id}`)
        return response.data
    },

    async getUserStats(userId: string): Promise<UserAttendanceStats> {
        const response = await api.get(`attendances/user/${userId}/stats`)
        return response.data
    },

    async getSessionStats(sessionId: number): Promise<SessionAttendanceStats> {
        const response = await api.get(`attendances/session/${sessionId}/stats`)
        return response.data
    },

    async getInactiveUsers(days?: number): Promise<InactiveUsersResponse> {
        const url = days != null
            ? `attendances/inactive-users?days=${Math.min(365, Math.max(1, days))}`
            : 'attendances/inactive-users'
        const response = await api.get(url)
        return response.data
    }
}
