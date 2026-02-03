import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Video, Users, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { fitnessSessionsService } from '@/lib/fitness-sessions'
import { attendanceService } from '@/lib/attendance'
import { analyticsService } from '@/lib/analytics'
import { formatDate } from '@/lib/utils'
import { ChartCard } from '@/components/dashboard/chart-card'

export function SessionDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: session, isLoading, error } = useQuery({
        queryKey: ['fitness-sessions', id],
        queryFn: () => fitnessSessionsService.getSession(Number(id)),
        enabled: !!id,
    })

    const { data: sessionStats, isLoading: statsLoading } = useQuery({
        queryKey: ['attendance-stats', 'session', id],
        queryFn: () => attendanceService.getSessionStats(Number(id)),
        enabled: !!id,
    })

    const { data: sessionAnalytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['session-analytics', id],
        queryFn: () => analyticsService.getSessionAnalytics(Number(id)),
        enabled: !!id,
    })

    const deleteMutation = useMutation({
        mutationFn: fitnessSessionsService.deleteSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fitness-sessions'] })
            toast.success('Session deleted successfully')
            navigate('/fitness-sessions')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete session')
        },
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !session) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/fitness-sessions')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Session Not Found</h1>
                        <p className="text-slate-600">The requested session could not be found.</p>
                    </div>
                </div>
            </div>
        )
    }

    // Determine participants list 
    const participants = session.data.join_tokens?.map(t => t.user) || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/fitness-sessions')}
                        className="mt-1"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{session.data.title}</h1>
                        <div className="flex items-center gap-2 mt-1 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.data.date)}</span>
                            <span className="text-slate-300">•</span>
                            <Clock className="h-4 w-4" />
                            <span>
                                {format(new Date(session.data.start_time), 'h:mm a')} - {format(new Date(session.data.end_time), 'h:mm a')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/fitness-sessions/${session.data.id}/edit`)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Session
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Session</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this session? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(session.data.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? <Skeleton className="h-8 w-12" /> : sessionStats?.total_users || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Attended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? <Skeleton className="h-8 w-12" /> : sessionStats?.attended_count || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Attendance Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? <Skeleton className="h-8 w-16" /> : `${sessionStats?.attendance_rate || 0}%`}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Fully Attended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? <Skeleton className="h-8 w-12" /> : sessionStats?.fully_attended_count || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Early Exits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? <Skeleton className="h-8 w-12" /> : sessionStats?.early_exit_count || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Section */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Avg. Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analyticsLoading ? <Skeleton className="h-8 w-12" /> : sessionAnalytics?.average_rating?.toFixed(1) || '-'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analyticsLoading ? <Skeleton className="h-8 w-12" /> : `${sessionAnalytics?.engagement_score || 0}%`}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Peak Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analyticsLoading ? <Skeleton className="h-8 w-12" /> : sessionAnalytics?.peak_concurrent_users || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analyticsLoading ? <Skeleton className="h-8 w-12" /> : sessionAnalytics?.feedback_count || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6">
                {analyticsLoading ? (
                    <Skeleton className="h-[300px]" />
                ) : (
                    <ChartCard
                        title="Join Time Distribution"
                        data={sessionAnalytics?.join_time_distribution || []}
                        type="bar"
                    />
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Session Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Session Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {session.data.zoom_join_url && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Video className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 overflow-hidden space-y-2">
                                    <div>
                                        <h4 className="font-semibold text-blue-900">Zoom Meeting</h4>
                                        <p className="text-sm text-blue-700">
                                            ID: {session.data.zoom_meeting_id}
                                        </p>
                                        {session.data.zoom_metadata?.password && (
                                            <p className="text-sm text-blue-700">
                                                Password: {session.data.zoom_metadata.password}
                                            </p>
                                        )}
                                        {session.data.zoom_metadata?.host_email && (
                                            <p className="text-sm text-blue-700">
                                                Host: {session.data.zoom_metadata.host_email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-1">
                                        {session.data.zoom_metadata?.start_url && (
                                            <a
                                                href={session.data.zoom_metadata.start_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline bg-blue-100/50 px-3 py-1.5 rounded-md border border-blue-200"
                                            >
                                                Start Meeting (Host)
                                            </a>
                                        )}
                                        <a
                                            href={session.data.zoom_join_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            Join Meeting
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <span className="text-sm font-medium text-slate-500">Availability Filter</span>
                            <Badge variant={session.data.filter_by_availability ? "default" : "secondary"}>
                                {session.data.filter_by_availability ? "Enabled" : "Disabled"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Participants Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Participants</CardTitle>
                            <Badge variant="outline">{participants.length} Users</Badge>
                        </div>
                        <CardDescription>
                            Users registered for this session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {participants.length > 0 ? (
                            <div className="space-y-4">
                                {participants.map((user) => (
                                    <div key={user.id} className="flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-slate-500 mb-1">Availability</p>
                                            <div className="flex flex-wrap justify-end gap-1">
                                                {user.availability_days.slice(0, 3).map((day) => (
                                                    <Badge key={day} variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                                        {day.substring(0, 3)}
                                                    </Badge>
                                                ))}
                                                {user.availability_days.length > 3 && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                        +{user.availability_days.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                <p>No participants yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
