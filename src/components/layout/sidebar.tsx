import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    X,
    Dumbbell,
    ClipboardList,
    Calendar as CalendarIcon,
    Utensils,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Fitness Sessions', href: '/fitness-sessions', icon: Dumbbell },
    { name: 'Upcoming Sessions', href: '/upcoming-sessions', icon: CalendarIcon },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Diet Plans', href: '/diet-plans', icon: Utensils },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation()

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 transition-transform duration-300 lg:static lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <img
                            src="/assets/crossfit-logo.jpg"
                            alt="Logo"
                            className="h-9 w-9 object-contain shrink-0"
                        />
                        <span className="text-xl font-semibold text-slate-900 truncate">Rishus Crossfit</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="lg:hidden hover:bg-slate-100"
                    >
                        <X className="h-5 w-5 text-slate-600" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href ||
                            (item.href !== '/' && location.pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-700 hover:bg-slate-100'
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 space-y-2">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} Rishus CrossFit
                    </p>
                   
                </div>
            </div>
        </>
    )
}
