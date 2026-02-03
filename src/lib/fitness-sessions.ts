import { api } from './api'

export interface ZoomMetadata {
    id: number
    start_url: string
    join_url: string
    password?: string
    encrypted_password?: string
    host_email?: string
    status?: string
    topic?: string
    duration?: number
}

export interface FitnessSession {
    id: number
    title: string
    date: string
    start_time: string
    end_time: string
    filter_by_availability: boolean
    user_ids?: number[]
    zoom_meeting_id?: string
    zoom_join_url?: string
    zoom_metadata?: ZoomMetadata
    join_tokens?: {
        id: number
        user_id: number
        token: string
        user: {
            id: number
            name: string
            email: string
            availability_days: string[]
        }
    }[]
    created_at: string
    updated_at: string
}

export interface CreateSessionData {
    title: string
    date: string
    start_time: string
    end_time: string
    filter_by_availability: boolean
    user_ids: number[]
}

export interface SessionsListResponse {
    data: FitnessSession[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface SessionStatistics {
    total_users: number
    attended_count: number
    attendance_rate: number
    fully_attended_count: number
    early_exit_count: number
}

export interface SessionDetailResponse {
    data: FitnessSession
    statistics: SessionStatistics
}

export interface SessionsFilters {
    date_from?: string
    date_to?: string
    date?: string
    page?: number
    per_page?: number
}

export const fitnessSessionsService = {
    async getSessions(filters: SessionsFilters = {}): Promise<SessionsListResponse> {
        const params = new URLSearchParams()

        if (filters.page) params.append('page', String(filters.page))
        if (filters.per_page) params.append('per_page', String(filters.per_page))
        if (filters.date_from) params.append('date_from', filters.date_from)
        if (filters.date_to) params.append('date_to', filters.date_to)
        if (filters.date) params.append('date', filters.date)

        const response = await api.get(`fitness-sessions?${params.toString()}`)
        return response.data
    },

    async getSession(id: number): Promise<SessionDetailResponse> {
        const response = await api.get(`fitness-sessions/${id}`)
        return response.data
    },

    async createSession(data: CreateSessionData): Promise<FitnessSession> {
        const response = await api.post('fitness-sessions', data)
        return response.data
    },

    async updateSession(id: number, data: Partial<CreateSessionData>): Promise<FitnessSession> {
        const response = await api.put(`fitness-sessions/${id}`, data)
        return response.data
    },

    async deleteSession(id: number): Promise<void> {
        await api.delete(`fitness-sessions/${id}`)
    },

    async getUpcomingSessions(per_page: number = 15): Promise<SessionsListResponse> {
        const response = await api.get(`fitness-sessions/upcoming?per_page=${per_page}`)
        return response.data
    },
}

