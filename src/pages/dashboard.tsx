import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
                                <span className="text-2xl font-bold text-amber-700">{dashboardData?.dropout_patterns.missed_3_days || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <span className="text-sm font-medium text-orange-900">Missed 5 Days</span>
                                <span className="text-2xl font-bold text-orange-700">{dashboardData?.dropout_patterns.missed_5_days || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="text-sm font-medium text-red-900">Missed 9+ Days</span>
                                <span className="text-2xl font-bold text-red-700">{dashboardData?.dropout_patterns.missed_9_days || 0}</span>
                            </div>
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
