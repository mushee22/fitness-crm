import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, User, Eye, UserX, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { attendanceService, type AttendanceFilters } from '@/lib/attendance'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

export function AttendancePage() {
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState<AttendanceFilters>({
        per_page: 20
    })
    const navigate = useNavigate()

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
                    <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
                    <p className="text-slate-500">Track attendance and find inactive users</p>
                </div>
            </div>

            <Tabs defaultValue="log" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="log">Attendance Log</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive Users</TabsTrigger>
                </TabsList>

                <TabsContent value="log" className="space-y-6">
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
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Session</TableHead>
                                    <TableHead>Join / Leave Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
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
                                            <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : data?.data && data.data.length > 0 ? (
                                    data.data.map((record) => (
                                        <TableRow
                                            key={record.id}
                                        >
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
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/attendance/${record.id}`)}>
                                                    <Eye className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No attendance records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-200">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                    <Skeleton className="h-4 w-40" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            ))
                        ) : data?.data && data.data.length > 0 ? (
                            data.data.map((record) => (
                                <div
                                    key={record.id}
                                    className="p-4 hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                                            <span className="font-medium text-slate-900">
                                                {format(new Date(record.created_at), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {record.user?.name || `User #${record.user_id}`}
                                                </p>
                                                <p className="text-xs text-slate-500">{record.user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="pl-11">
                                            <p className="text-sm font-medium text-slate-900 mb-1">
                                                {record.fitness_session?.title || `Session #${record.fitness_session_id}`}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <span className="font-medium uppercase">In:</span>
                                                    {record.joined_at ? format(new Date(record.joined_at), 'h:mm a') : '-'}
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <span className="font-medium uppercase">Out:</span>
                                                    {record.left_at ? format(new Date(record.left_at), 'h:mm a') : '-'}
                                                </div>
                                                <div className="col-span-2 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Duration: {record.total_minutes_attended} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                No attendance records found.
                            </div>
                        )}
                    </div>

                </CardContent>
            </Card>
                </TabsContent>

                <TabsContent value="inactive" className="space-y-6">
                    <InactiveUsersTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function getWhatsAppUrl(phone: string): string {
    const digits = (phone || '').replace(/\D/g, '')
    return digits ? `https://wa.me/${digits}` : '#'
}

function InactiveUsersTab() {
    const [days, setDays] = useState<string>('')
    const navigate = useNavigate()

    const { data, isLoading } = useQuery({
        queryKey: ['attendances', 'inactive-users', days],
        queryFn: () => attendanceService.getInactiveUsers(days === '' ? undefined : Number(days)),
    })

    const DAY_OPTIONS = [3, 5, 7, 10]

    return (
        <>
            <Card>
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-slate-900 flex items-center gap-2">
                                <UserX className="h-5 w-5 text-amber-600" />
                                Inactive Users
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Users who have missed at least this many consecutive days. Used to follow up or send absence reminders.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-48">
                            <Label htmlFor="inactive-days" className="text-sm whitespace-nowrap">Min. missed days</Label>
                            <Select value={days === '' ? 'all' : days} onValueChange={(v) => setDays(v === 'all' ? '' : v)}>
                                <SelectTrigger id="inactive-days">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {DAY_OPTIONS.map((d) => (
                                        <SelectItem key={d} value={String(d)}>{d} days</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-14 bg-slate-100" />
                            ))}
                        </div>
                    ) : data?.users && data.users.length > 0 ? (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/30">
                                            <TableHead className="text-slate-700 font-semibold">User</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Contact</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Missed days</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Last attended</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Reminders</TableHead>
                                            <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.users.map((u) => (
                                            <TableRow key={u.id} className="border-slate-200 hover:bg-slate-50/50">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{u.name}</p>
                                                        <p className="text-xs text-slate-500">{u.user_name ? `@${u.user_name}` : u.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="text-slate-900">{u.phone}</p>
                                                        <p className="text-xs text-slate-500">{u.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{u.consecutive_missed_days} days</Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    {u.last_attended_at ? formatDate(u.last_attended_at) : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {u.send_absence_reminders ? (
                                                        <Badge className="bg-green-600">On</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Off</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        >
                                                            <a
                                                                href={getWhatsAppUrl(u.whatsapp_number ?? u.phone)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <MessageCircle className="h-4 w-4 mr-1" />
                                                                Send message
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/users/${u.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="md:hidden divide-y divide-slate-200">
                                {data.users.map((u) => (
                                    <div key={u.id} className="p-4 hover:bg-slate-50/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium text-slate-900">{u.name}</p>
                                                <p className="text-xs text-slate-500">{u.user_name ? `@${u.user_name}` : u.email}</p>
                                            </div>
                                            <Badge variant="secondary">{u.consecutive_missed_days} days</Badge>
                                        </div>
                                        <div className="text-sm text-slate-600 space-y-1 mb-3">
                                            <p>Last attended: {u.last_attended_at ? formatDate(u.last_attended_at) : '—'}</p>
                                            <p>Reminders: {u.send_absence_reminders ? 'On' : 'Off'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                                                asChild
                                            >
                                                <a
                                                    href={getWhatsAppUrl(u.whatsapp_number ?? '')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-1" />
                                                    Send message
                                                </a>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => navigate(`/users/${u.id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View user
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50/30 text-sm text-slate-600">
                                {data.total} user{data.total !== 1 ? 's' : ''} inactive for {data.days}+ consecutive days
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <UserX className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p className="font-medium">No inactive users</p>
                            <p className="text-sm mt-1">No users have missed {data?.days != null ? `${data.days}+` : days === '' ? 'the minimum' : `${days}+`} consecutive days.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
