import { api } from './api'
import { type Attendance } from './attendance'

export interface DashboardFilters {
    date_from?: string
    date_to?: string
}

export interface ChartData {
    name: string
    value: number
}

export interface DashboardData {
    period: {
        from: string
        to: string
    }
    users: {
        total: number
        active: number
        inactive: number
    }
    sessions: {
        total: number
        with_attendance: number
        attendance_rate: number
    }
    attendance: {
        total_attendances: number
        fully_attended: number
        early_exits: number
        early_exit_percentage: number
        average_duration_minutes: number
    }
    dropout_patterns: {
        missed_3_days: number
        missed_5_days: number
        missed_9_days: number
    }
    daily_participation: Array<{
        date: string
        session_id: number
        session_title: string
        participation_count: number
    }>
}

export interface UserAnalytics {
    user: {
        id: number
        name: string
        phone: string
    }
    attendance_statistics: {
        total_sessions_attended: number
        fully_attended_sessions: number
        early_exit_sessions: number
        early_exit_percentage: number
        average_attendance_duration: number
        total_minutes_attended: number
    }
    absence_info: {
        consecutive_missed_days: number
        last_attended_at: string | null
    }
    recent_attendances: Attendance[]
}

export interface SessionAnalytics {
    average_rating: number
    feedback_count: number
    engagement_score: number
    peak_concurrent_users: number
    join_time_distribution: ChartData[]
}

export const analyticsService = {
    async getDashboardStats(filters: DashboardFilters = {}): Promise<DashboardData> {
        const params = new URLSearchParams()
        if (filters.date_from) params.append('date_from', filters.date_from)
        if (filters.date_to) params.append('date_to', filters.date_to)

        const response = await api.get(`analytics/dashboard?${params.toString()}`)
        return response.data
    },

    async getUserAnalytics(userId: string): Promise<UserAnalytics> {
        const response = await api.get(`analytics/user/${userId}`)
        return response.data
    },

    async getSessionAnalytics(sessionId: number): Promise<SessionAnalytics> {
        const response = await api.get(`analytics/session/${sessionId}`)
        return response.data
    }
}
