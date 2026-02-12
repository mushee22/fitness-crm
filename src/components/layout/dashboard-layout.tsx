import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
