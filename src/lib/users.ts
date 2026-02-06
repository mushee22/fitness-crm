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

export const usersService = {
    async getUsers(page = 1, perPage = 15, search?: string): Promise<UsersListResponse> {
        let url = `users?page=${page}&per_page=${perPage}`
        if (search) {
            url += `&search=${encodeURIComponent(search)}`
        }
        const response = await api.get(url)
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
}
