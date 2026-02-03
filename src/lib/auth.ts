import { api } from './api'

export interface LoginCredentials {
    email: string
    password: string
}

export interface LoginResponse {
    token: string
    user: User
}

export interface User {
    id: number
    name: string
    email: string
    role?: string
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await api.post('/auth/login', credentials)
        const { token } = response.data

        // Store token
        if (token) {
            localStorage.setItem('auth_token', token)
        }

        return response.data
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get('/auth/me')
        // API returns { admin: { id, name, email, created_at } }
        return response.data.admin
    },

    logout() {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token')
    },

    isAuthenticated(): boolean {
        return !!this.getToken()
    },
}
