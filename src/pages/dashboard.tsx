import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Users, Clock, AlertTriangle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ChartCard } from '@/components/dashboard/chart-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { analyticsService } from '@/lib/analytics'

export function DashboardPage() {
    const [dateFrom, setDateFrom] = useState<Date>()
    const [dateTo, setDateTo] = useState<Date>()

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-stats', dateFrom, dateTo],
        queryFn: () => analyticsService.getDashboardStats({
            date_from: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
            date_to: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined
        }),
    })

    const { data: dropoutData } = useQuery({
        queryKey: ['dropout-analytics'],
        queryFn: () => analyticsService.getDropoutAnalytics(),
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 bg-slate-200" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Welcome back! Here's your overview.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-[140px] justify-start text-left font-normal ${!dateFrom && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={dateFrom}
                                onSelect={setDateFrom}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-[140px] justify-start text-left font-normal ${!dateTo && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateTo ? format(dateTo, "MMM d, yyyy") : "To Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={dateTo}
                                onSelect={setDateTo}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {(dateFrom || dateTo) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDateFrom(undefined)
                                setDateTo(undefined)
                            }}
                            title="Clear Dates"
                        >
                            <span className="text-xs">✕</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Active Users"
                    value={dashboardData?.users.active || 0}
                    change={0} // No change data in API yet
                    icon={Users}
                    index={0}
                />
                <KPICard
                    title="Attendance Rate"
                    value={`${dashboardData?.sessions.attendance_rate || 0}%`}
                    change={0}
                    icon={CalendarIcon}
                    index={1}
                />
                <KPICard
                    title="Total Attendances"
                    value={dashboardData?.attendance.total_attendances || 0}
                    change={0}
                    icon={Users}
                    index={2}
                />
                <KPICard
                    title="Avg Duration"
                    value={`${dashboardData?.attendance.average_duration_minutes || 0}m`}
                    change={0}
                    icon={Clock}
                    index={3}
                />
            </div>

            {/* Dropout Risk & Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Dropout Patterns - Takes up 3 columns on large screens */}
                <Card className="col-span-3 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Dropout Risk
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <span className="text-sm font-medium text-amber-900">Missed 3 Days</span>
                                <span className="text-2xl font-bold text-amber-700">{dropoutData?.dropout_patterns.missed_3_days || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <span className="text-sm font-medium text-orange-900">Missed 5 Days</span>
                                <span className="text-2xl font-bold text-orange-700">{dropoutData?.dropout_patterns.missed_5_days || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="text-sm font-medium text-red-900">Missed 9+ Days</span>
                                <span className="text-2xl font-bold text-red-700">{(dropoutData?.dropout_patterns.missed_9_days || 0) + (dropoutData?.dropout_patterns.missed_10_days || 0)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* At Risk Users List */}
                <Card className="col-span-3 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-slate-500" />
                                Users at Risk
                            </div>
                            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                {(dropoutData?.users_missed_3_days.length || 0) +
                                    (dropoutData?.users_missed_5_days.length || 0) +
                                    (dropoutData?.users_missed_9_days.length || 0) +
                                    (dropoutData?.users_missed_10_days.length || 0)} users
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {/* 10+ Days - Critical */}
                            {dropoutData?.users_missed_10_days.map((user) => (
                                <div key={`10-${user.id}`} className="flex items-start justify-between p-3 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 font-bold text-red-700">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <Link to={`/users/${user.id}`} className="font-medium text-slate-900 hover:underline">
                                                {user.name}
                                            </Link>
                                            <p className="text-xs text-slate-500">Last attended: {user.last_attended_at ? format(new Date(user.last_attended_at), 'MMM d') : 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-100 text-red-700">
                                            CRITICAL
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">10+ days absent</p>
                                    </div>
                                </div>
                            ))}

                            {/* 9 Days - High */}
                            {dropoutData?.users_missed_9_days.map((user) => (
                                <div key={`9-${user.id}`} className="flex items-start justify-between p-3 rounded-lg border border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 font-bold text-orange-700">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <Link to={`/users/${user.id}`} className="font-medium text-slate-900 hover:underline">
                                                {user.name}
                                            </Link>
                                            <p className="text-xs text-slate-500">Last attended: {user.last_attended_at ? format(new Date(user.last_attended_at), 'MMM d') : 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-orange-100 text-orange-700">
                                            HIGH
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">9 days absent</p>
                                    </div>
                                </div>
                            ))}

                            {/* 5 Days - Medium */}
                            {dropoutData?.users_missed_5_days.map((user) => (
                                <div key={`5-${user.id}`} className="flex items-start justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 font-bold text-amber-700">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <Link to={`/users/${user.id}`} className="font-medium text-slate-900 hover:underline">
                                                {user.name}
                                            </Link>
                                            <p className="text-xs text-slate-500">Last attended: {user.last_attended_at ? format(new Date(user.last_attended_at), 'MMM d') : 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-100 text-amber-700">
                                            MEDIUM
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">5+ days absent</p>
                                    </div>
                                </div>
                            ))}

                            {/* 3 Days - Low/Notice */}
                            {dropoutData?.users_missed_3_days.map((user) => (
                                <div key={`3-${user.id}`} className="flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-600">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <Link to={`/users/${user.id}`} className="font-medium text-slate-900 hover:underline">
                                                {user.name}
                                            </Link>
                                            <p className="text-xs text-slate-500">Last attended: {user.last_attended_at ? format(new Date(user.last_attended_at), 'MMM d') : 'Never'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                                            NOTICE
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">3+ days absent</p>
                                    </div>
                                </div>
                            ))}

                            {(!dropoutData?.users_missed_3_days?.length &&
                                !dropoutData?.users_missed_5_days?.length &&
                                !dropoutData?.users_missed_9_days?.length &&
                                !dropoutData?.users_missed_10_days?.length) && (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No users currently flagged at risk.
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>

                {/* Participation Chart - Takes up 4 columns on large screens */}
                <div className="col-span-4">
                    {isLoading ? (
                        <Skeleton className="h-[350px] bg-slate-200" />
                    ) : (
                        <ChartCard
                            title="Daily Participation"
                            data={dashboardData?.daily_participation.map(d => ({
                                name: format(new Date(d.date), 'MMM d'),
                                value: d.participation_count
                            })) || []}
                            type="bar"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
