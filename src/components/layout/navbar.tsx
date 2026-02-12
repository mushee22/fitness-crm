import { Menu, LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { getInitials } from '@/lib/utils'

interface NavbarProps {
    onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="flex h-16 items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6">
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </Button>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hidden sm:block">Dashboard</h2>
            </div>

            <div className="flex items-center gap-2">
                {/* Dark mode toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? (
                        <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    ) : (
                        <Moon className="h-5 w-5 text-slate-600" />
                    )}
                </Button>
                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/20 text-primary-foreground text-sm font-medium">
                                    {user ? getInitials(user.name) : 'AD'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 dark:bg-slate-800 dark:border-slate-700">
                        <div className="flex items-center justify-start gap-2 p-2">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                    {user?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user?.email || 'admin@example.com'}
                                </p>
                            </div>
                        </div>
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
