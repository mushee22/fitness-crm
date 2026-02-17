import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle, Video } from 'lucide-react'
import { formatTimeKolkata, formatDateKolkata } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { attendanceService } from '@/lib/attendance'

export function AttendanceDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data: attendanceData, isLoading, error } = useQuery({
        queryKey: ['attendance', id],
        queryFn: () => attendanceService.getAttendance(Number(id)),
        enabled: !!id,
    })

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !attendanceData?.data) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Attendance Not Found</h1>
                        <p className="text-slate-600">The requested attendance record could not be found.</p>
                    </div>
                </div>
            </div>
        )
    }

    const attendance = attendanceData.data

    const getStatusBadge = () => {
        if (attendance.attended_fully) {
            return (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 w-fit">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Attended Fully</span>
                </div>
            )
        }
        if (attendance.early_exit) {
            return (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 w-fit">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Exited Early</span>
                </div>
            )
        }
        return (
            <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 w-fit">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Partial / Incomplete</span>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mt-1"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance Details</h1>
                    <div className="flex items-center gap-2 mt-1 text-slate-500">
                        <span className="font-mono text-sm">ID: #{attendance.id}</span>
                        <span>•</span>
                        <span>{formatDateKolkata(attendance.created_at)}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User & Session Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Session & Participant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* User Info */}
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Participant</p>
                                <Link
                                    to={`/users/${attendance.user_id}`}
                                    className="text-lg font-semibold text-slate-900 hover:text-blue-600 hover:underline block truncate"
                                >
                                    {attendance.user?.name || `User #${attendance.user_id}`}
                                </Link>
                                <p className="text-sm text-slate-500 truncate">{attendance.user?.email}</p>
                            </div>
                        </div>

                        {/* Session Info */}
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 font-bold">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Session</p>
                                <Link
                                    to={`/fitness-sessions/${attendance.fitness_session_id}`}
                                    className="text-lg font-semibold text-slate-900 hover:text-blue-600 hover:underline block truncate"
                                >
                                    {attendance.fitness_session?.title || `Session #${attendance.fitness_session_id}`}
                                </Link>
                                <p className="text-sm text-slate-500">
                                    {attendance.fitness_session?.start_time ? formatTimeKolkata(attendance.fitness_session.start_time) : 'N/A'}
                                    {' - '}
                                    {attendance.fitness_session?.end_time ? formatTimeKolkata(attendance.fitness_session.end_time) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Stats Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Status</CardTitle>
                        <CardDescription>
                            Detailed breakdown of time attended
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-2">Overall Status</p>
                            {getStatusBadge()}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Joined At</p>
                                <p className="font-semibold text-slate-900">
                                    {attendance.joined_at ? formatTimeKolkata(attendance.joined_at) : '-'}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Left At</p>
                                <p className="font-semibold text-slate-900">
                                    {attendance.left_at ? formatTimeKolkata(attendance.left_at) : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-xs font-medium text-blue-600 uppercase">Total Duration</p>
                                <p className="text-xl font-bold">{attendance.total_minutes_attended} minutes</p>
                            </div>
                        </div>

                        {attendance.zoom_participant_id && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                <Video className="h-3 w-3" />
                                <span>Zoom Participant ID: {attendance.zoom_participant_id}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
