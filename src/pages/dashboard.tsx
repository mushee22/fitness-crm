import { useState, useMemo } from 'react'
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

    const uniqueAtRiskUsers = useMemo(() => {
        const byId = new Map<number, { user: { id: number; name: string; last_attended_at?: string | null }; level: number }>()
        const add = (list: { id: number; name: string; last_attended_at?: string | null }[] | undefined, level: number) => {
            list?.forEach((u) => {
                if (!byId.has(u.id) || byId.get(u.id)!.level < level) byId.set(u.id, { user: u, level })
            })
        }
        add(dropoutData?.users_missed_3_days, 3)
        add(dropoutData?.users_missed_5_days, 5)
        add(dropoutData?.users_missed_7_days, 7)
        add(dropoutData?.users_missed_9_days, 9)
        add(dropoutData?.users_missed_10_days, 10)
        return Array.from(byId.values()).sort((a, b) => b.level - a.level)
    }, [dropoutData])

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
                            <div className="flex items-center justify-between p-3 bg-orange-100/50 rounded-lg border border-orange-200">
                                <span className="text-sm font-medium text-orange-900">Missed 7 Days</span>
                                <span className="text-2xl font-bold text-orange-700">{dropoutData?.dropout_patterns.missed_7_days || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="text-sm font-medium text-red-900">Missed 9 Days</span>
                                <span className="text-2xl font-bold text-red-700">{dropoutData?.dropout_patterns.missed_9_days || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-100/50 rounded-lg border border-red-200">
                                <span className="text-sm font-medium text-red-900">Missed 10 Days</span>
                                <span className="text-2xl font-bold text-red-700">{dropoutData?.dropout_patterns.missed_10_days || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* At Risk Users List - unique users only, shown in highest risk bucket */}
                <Card className="col-span-3 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-slate-500" />
                                Users at Risk
                            </div>
                            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                {uniqueAtRiskUsers.length} users
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {uniqueAtRiskUsers.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No users currently flagged at risk.
                                </div>
                            ) : (
                                uniqueAtRiskUsers.map(({ user, level }) => {
                                    const levelConfig: Record<number, { label: string; sub: string; className: string; badgeClass: string; borderClass: string; bgClass: string; textClass: string }> = {
                                        10: { label: 'CRITICAL', sub: '10+ days absent', className: 'border-red-100 bg-red-50/50 hover:bg-red-50', badgeClass: 'bg-red-100 text-red-700', borderClass: 'border-red-100', bgClass: 'bg-red-100', textClass: 'text-red-700' },
                                        9: { label: 'HIGH', sub: '9 days absent', className: 'border-orange-100 bg-orange-50/50 hover:bg-orange-50', badgeClass: 'bg-orange-100 text-orange-700', borderClass: 'border-orange-100', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
                                        7: { label: 'ELEVATED', sub: '7 days absent', className: 'border-orange-100 bg-orange-50/30 hover:bg-orange-50/50', badgeClass: 'bg-orange-100 text-orange-700', borderClass: 'border-orange-100', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
                                        5: { label: 'MEDIUM', sub: '5+ days absent', className: 'border-amber-100 bg-amber-50/50 hover:bg-amber-50', badgeClass: 'bg-amber-100 text-amber-700', borderClass: 'border-amber-100', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
                                        3: { label: 'NOTICE', sub: '3+ days absent', className: 'border-slate-100 hover:bg-slate-50', badgeClass: 'bg-slate-100 text-slate-600', borderClass: 'border-slate-100', bgClass: 'bg-slate-100', textClass: 'text-slate-600' },
                                    }
                                    const config = levelConfig[level]
                                    return (
                                        <div key={user.id} className={`flex items-start justify-between p-3 rounded-lg border ${config.borderClass} ${config.className} transition-colors`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`h-10 w-10 rounded-full ${config.bgClass} flex items-center justify-center shrink-0 font-bold ${config.textClass}`}>
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
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${config.badgeClass}`}>
                                                    {config.label}
                                                </span>
                                                <p className="text-xs text-slate-400 mt-1">{config.sub}</p>
                                            </div>
                                        </div>
                                    )
                                })
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
