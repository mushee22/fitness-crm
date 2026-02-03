import React, { createContext, useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService, type User } from '@/lib/auth'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())

    const { data: user, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: isAuthenticated,
        retry: false,
        staleTime: Infinity,
    })

    const logout = () => {
        setIsAuthenticated(false)
        authService.logout()
    }

    return (
        <AuthContext.Provider value={{ user: user || null, isLoading, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
