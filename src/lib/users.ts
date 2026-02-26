import { api } from './api'

export interface User {
    id: number
    name: string
    user_name?: string
    phone: string
    whatsapp_number: string
    email: string
    blood_group: string
    height_cm: number
    weight_kg: number
    joined_at: string
    end_date: string
    availability_days: string[]
    created_at?: string
    updated_at?: string
    send_absence_reminders?: boolean
}

export interface CreateUserData {
    name: string
    user_name: string
    phone: string
    whatsapp_number: string
    email: string
    blood_group: string
    height_cm: number
    weight_kg: number
    joined_at: string
    end_date: string
    availability_days: string[]
    send_absence_reminders: boolean
}

export interface UsersListResponse {
    data: User[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface ImportSkipReason {
    row: number
    reason: string
    detail: string
}

export interface ImportUsersResponse {
    message: string
    total_rows_in_file?: number
    created?: number
    skipped?: number
    skip_reasons?: ImportSkipReason[]
}

export interface UserDetailsResponse {
    data: User & {
        weight_history?: any[]
        height_history?: any[]
        activity_logs?: any[]
        attendances?: any[]
        diet_plans?: any[]
        consecutive_missed_days?: number
        last_attended_at?: string | null
    }
    attendance_stats: {
        total_sessions_attended: number
        fully_attended_sessions: number
        early_exit_sessions: number
        early_exit_percentage: number
        average_attendance_duration: number
        total_minutes_attended: number
    }
}

export const usersService = {
    async getUsers(page = 1, perPage = 15, search?: string): Promise<UsersListResponse> {
        let url = `users?page=${page}&per_page=${perPage}`
        if (search) {
            url += `&search=${encodeURIComponent(search)}`
        }
        const response = await api.get(url)
        return response.data
    },

    async getUser(id: number | string): Promise<UserDetailsResponse> {
        const response = await api.get(`users/${id}`)
        return response.data
    },

    async createUser(data: CreateUserData): Promise<User> {
        const response = await api.post('users', data)
        return response.data
    },

    async updateUser(id: number, data: Partial<CreateUserData>): Promise<User> {
        const response = await api.put(`users/${id}`, data)
        return response.data
    },

    async deleteUser(id: number): Promise<void> {
        await api.delete(`users/${id}`)
    },

    async importUsers(file: File): Promise<ImportUsersResponse> {
        const formData = new FormData()
        formData.append('file', file)
        const response = await api.post('users/import-xlsx', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },
}
