import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, Search, Plus, Calendar as CalendarIcon, Clock, Users, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { fitnessSessionsService, type FitnessSession } from '@/lib/fitness-sessions'
import { formatDate } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

export function FitnessSessionsPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [dateFrom, setDateFrom] = useState<Date>()
    const [dateTo, setDateTo] = useState<Date>()
    const [specificDate, setSpecificDate] = useState<Date>()
    const [deletingSession, setDeletingSession] = useState<FitnessSession | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['fitness-sessions', page, dateFrom, dateTo, specificDate],
        queryFn: () => fitnessSessionsService.getSessions({
            page,
            date_from: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
            date_to: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
            date: specificDate ? format(specificDate, 'yyyy-MM-dd') : undefined,
        }),
    })

    const deleteMutation = useMutation({
        mutationFn: fitnessSessionsService.deleteSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fitness-sessions'] })
            setDeletingSession(null)
            toast.success('Session deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete session')
        },
    })

    const filteredSessions = data?.data?.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Fitness Sessions</h1>
                    <p className="text-sm sm:text-base text-slate-600 mt-1">Manage training sessions and schedules</p>
                </div>
                <Button onClick={() => navigate('/fitness-sessions/create')} className="shadow-sm w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-slate-900">All Sessions</CardTitle>
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search sessions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">Specific Date</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!specificDate && "text-muted-foreground"}`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {specificDate ? format(specificDate, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={specificDate}
                                        onSelect={(date) => {
                                            setSpecificDate(date)
                                            setPage(1)
                                            // Clear range if specific date is selected to avoid conflict
                                            if (date) {
                                                setDateFrom(undefined)
                                                setDateTo(undefined)
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">From Date</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!dateFrom && "text-muted-foreground"}`}
                                        disabled={!!specificDate}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateFrom}
                                        onSelect={(date) => {
                                            setDateFrom(date)
                                            setPage(1)
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">To Date</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!dateTo && "text-muted-foreground"}`}
                                        disabled={!!specificDate}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateTo}
                                        onSelect={(date) => {
                                            setDateTo(date)
                                            setPage(1)
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    {/* Clear filters button if any filter is active */}
                    {(dateFrom || dateTo || specificDate) && (
                        <div className="flex justify-end mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setDateFrom(undefined)
                                    setDateTo(undefined)
                                    setSpecificDate(undefined)
                                    setPage(1)
                                }}
                                className="text-slate-500 hover:text-slate-900"
                            >
                                Clear Date Filters
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 sm:p-6 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-20 bg-slate-100" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/30">
                                            <TableHead className="text-slate-700 font-semibold">Session</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Date</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Time</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Participants</TableHead>
                                            <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSessions?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-32 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                        <CalendarIcon className="h-12 w-12 mb-2 text-slate-300" />
                                                        <p className="font-medium">No sessions found</p>
                                                        <p className="text-sm">Create your first session to get started</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredSessions?.map((session) => (
                                                <TableRow
                                                    key={session.id}
                                                    className="border-slate-200 hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                <CalendarIcon className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <button
                                                                    onClick={() => navigate(`/fitness-sessions/${session.id}`)}
                                                                    className="font-medium text-slate-900 hover:text-blue-600 hover:underline transition-colors text-left"
                                                                >
                                                                    {session.title}
                                                                </button>
                                                                {session.filter_by_availability && (
                                                                    <Badge variant="secondary" className="text-xs mt-1">
                                                                        Filtered by availability
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-900">
                                                        {formatDate(session.date)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-slate-900">
                                                            <Clock className="h-4 w-4 text-slate-400" />
                                                            {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4 text-slate-400" />
                                                            <span className="text-slate-900">{session.attendances?.length ?? 0}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                onClick={() => navigate(`/fitness-sessions/${session.id}`)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                                                onClick={() => navigate(`/fitness-sessions/${session.id}/edit`)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                onClick={() => setDeletingSession(session)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-200">
                                {filteredSessions?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                                        <CalendarIcon className="h-12 w-12 mb-2 text-slate-300" />
                                        <p className="font-medium">No sessions found</p>
                                        <p className="text-sm">Create your first session to get started</p>
                                    </div>
                                ) : (
                                    filteredSessions?.map((session) => (
                                        <div key={session.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-slate-900">{session.title}</h3>
                                                    <p className="text-sm text-slate-500">{formatDate(session.date)}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                <div>
                                                    <p className="text-slate-500 text-xs">Time</p>
                                                    <p className="text-slate-900">
                                                        {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs">Participants</p>
                                                    <p className="text-slate-900">{session.attendances?.length ?? 0} users</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => navigate(`/fitness-sessions/${session.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => navigate(`/fitness-sessions/${session.id}/edit`)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDeletingSession(session)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {data && data.last_page > 1 && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/30">
                                    <p className="text-sm text-slate-600 text-center sm:text-left">
                                        Page {data.current_page} of {data.last_page} ({data.total} total)
                                    </p>
                                    <div className="flex gap-2 justify-center sm:justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === data.last_page}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingSession} onOpenChange={() => setDeletingSession(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Session</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingSession?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeletingSession(null)} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingSession && deleteMutation.mutate(deletingSession.id)}
                            disabled={deleteMutation.isPending}
                            className="w-full sm:w-auto"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
