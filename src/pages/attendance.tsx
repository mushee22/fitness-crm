import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { attendanceService, type AttendanceFilters } from '@/lib/attendance'
import { Skeleton } from '@/components/ui/skeleton'

export function AttendancePage() {
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState<AttendanceFilters>({
        per_page: 20
    })

    const { data, isLoading } = useQuery({
        queryKey: ['attendances', page, filters],
        queryFn: () => attendanceService.getAttendances({ ...filters, page }),
    })

    const handleFilterChange = (key: keyof AttendanceFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
        setPage(1)
    }

    const clearFilters = () => {
        setFilters({ per_page: 20 })
        setPage(1)
    }

    const getStatusBadge = (attendedFully: boolean, earlyExit: boolean) => {
        if (attendedFully) return <Badge className="bg-green-500">Attended Fully</Badge>
        if (earlyExit) return <Badge className="bg-orange-500">Left Early</Badge>
        return <Badge variant="destructive">Missed / Incomplete</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance Log</h1>
                    <p className="text-slate-500">Track user attendance across sessions</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>User ID</Label>
                            <Input
                                placeholder="Search by User ID"
                                value={filters.user_id || ''}
                                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Session ID</Label>
                            <Input
                                placeholder="Search by Session ID"
                                value={filters.fitness_session_id || ''}
                                onChange={(e) => handleFilterChange('fitness_session_id', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date From</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.date_from ? format(new Date(filters.date_from), 'PP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={filters.date_from ? new Date(filters.date_from) : undefined}
                                        onSelect={(date) => handleFilterChange('date_from', date ? format(date, 'yyyy-MM-dd') : undefined)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Date To</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.date_to ? format(new Date(filters.date_to), 'PP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={filters.date_to ? new Date(filters.date_to) : undefined}
                                        onSelect={(date) => handleFilterChange('date_to', date ? format(date, 'yyyy-MM-dd') : undefined)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                                id="attended"
                                checked={filters.attended_fully}
                                onCheckedChange={(checked) => handleFilterChange('attended_fully', checked ? true : undefined)}
                            />
                            <Label htmlFor="attended">Fully Attended</Label>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                                id="early_exit"
                                checked={filters.early_exit}
                                onCheckedChange={(checked) => handleFilterChange('early_exit', checked ? true : undefined)}
                            />
                            <Label htmlFor="early_exit">Early Exit</Label>
                        </div>
                        <div className="flex items-end pt-2 lg:col-span-2 justify-end">
                            <Button variant="ghost" onClick={clearFilters} className="text-slate-500">
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Join / Leave Time</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.data && data.data.length > 0 ? (
                                data.data.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(record.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{record.user?.name || `User #${record.user_id}`}</span>
                                                <span className="text-xs text-slate-500">{record.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{record.fitness_session?.title || `Session #${record.fitness_session_id}`}</span>
                                                <span className="text-xs text-slate-500">
                                                    {record.fitness_session?.start_time ? format(new Date(record.fitness_session.start_time), 'h:mm a') : 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <span className="text-xs uppercase w-8">In</span>
                                                    {record.joined_at ? format(new Date(record.joined_at), 'h:mm a') : '-'}
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <span className="text-xs uppercase w-8">Out</span>
                                                    {record.left_at ? format(new Date(record.left_at), 'h:mm a') : '-'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {record.total_minutes_attended} min
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(record.attended_fully, record.early_exit)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No attendance records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
