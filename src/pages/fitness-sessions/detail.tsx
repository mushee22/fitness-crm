import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    Calendar,
    Clock,
    Video,
    Users,
    Trash2,
    Edit,
    Activity,
    AlertTriangle,
    Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { fitnessSessionsService } from '@/lib/fitness-sessions'
import { analyticsService } from '@/lib/analytics'
import { attendanceService } from '@/lib/attendance'
import { formatDate } from '@/lib/utils'

export function SessionDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: sessionData, isLoading, error } = useQuery({
        queryKey: ['fitness-sessions', id],
        queryFn: () => fitnessSessionsService.getSession(Number(id)),
        enabled: !!id,
    })

    const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
        queryKey: ['session-analytics', id],
        queryFn: () => analyticsService.getSessionAnalytics(Number(id)),
        enabled: !!id,
    })

    const { data: attendanceStats } = useQuery({
        queryKey: ['session-attendance-stats', id],
        queryFn: () => attendanceService.getSessionStats(Number(id)),
        enabled: !!id,
    })

    const session = sessionData?.data

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
                        <h1 className="text-2xl font-bold text-slate-900">{session.title}</h1>
                        <div className="flex items-center gap-2 mt-1 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.date)}</span>
                            <span className="text-slate-300">•</span>
                            <Clock className="h-4 w-4" />
                            <span>
                                {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/fitness-sessions/${session.id}/edit`)}
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
                                    onClick={() => deleteMutation.mutate(session.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="attendees">Attendees</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Overview Content */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Participants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {session.attendances?.length ?? 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {attendanceStats?.total_users || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Attended</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {attendanceStats?.attended_count || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Attendance Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {`${attendanceStats?.attendance_rate || 0}%`}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Fully Attended</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {attendanceStats?.fully_attended_count || 0}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Session Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {session.zoom_join_url && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Video className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 overflow-hidden space-y-2">
                                            <div>
                                                <h4 className="font-semibold text-blue-900">Zoom Meeting</h4>
                                                <p className="text-sm text-blue-700">
                                                    ID: {session.zoom_meeting_id}
                                                </p>
                                                {session.zoom_metadata?.password && (
                                                    <p className="text-sm text-blue-700">
                                                        Password: {session.zoom_metadata.password}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-3 pt-1">
                                                {session.zoom_metadata?.start_url && (
                                                    <a
                                                        href={session.zoom_metadata.start_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline bg-blue-100/50 px-3 py-1.5 rounded-md border border-blue-200"
                                                    >
                                                        Start Meeting (Host)
                                                    </a>
                                                )}
                                                <a
                                                    href={session.zoom_join_url}
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
                                    <Badge variant={session.filter_by_availability ? "default" : "secondary"}>
                                        {session.filter_by_availability ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    {/* Analytics Content from analyticsService */}
                    {isLoadingAnalytics ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-32 bg-slate-200" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Early Exits</CardTitle>
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analytics?.statistics.early_exits || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {analytics?.statistics.early_exit_percentage || 0}% of attendees
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                                        <Clock className="h-4 w-4 text-blue-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analytics?.statistics.average_duration_minutes || 0}m
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Expected: {analytics?.statistics.expected_duration_minutes || 60}m
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Fully Attended</CardTitle>
                                        <Activity className="h-4 w-4 text-green-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analytics?.statistics.fully_attended || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Users attended full session
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        <Users className="h-4 w-4 text-slate-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analytics?.statistics.total_users || 0}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="attendees" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Attended Users</CardTitle>
                                <Badge variant="outline">{session.attendances?.length || 0} Users</Badge>
                            </div>
                            <CardDescription>
                                Users who joined the session
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {session.attendances && session.attendances.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Join Time</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {session.attendances.map((attendance) => (
                                            <TableRow key={attendance.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                                                            {attendance.user.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <Link to={`/users/${attendance.user.id}`} className="font-medium text-slate-900 hover:underline">
                                                                {attendance.user.name}
                                                            </Link>
                                                            <p className="text-xs text-slate-500">{attendance.user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.attended_fully ? <Badge className="bg-green-500">Attended</Badge> :
                                                        attendance.early_exit ? <Badge className="bg-orange-500">Left Early</Badge> :
                                                            <Badge variant="secondary">Partial</Badge>
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.joined_at ? format(new Date(attendance.joined_at), 'h:mm a') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/attendance/${attendance.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                    <p>No attendees yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Invited Users</CardTitle>
                                <Badge variant="outline">{session.join_tokens?.length || 0} Users</Badge>
                            </div>
                            <CardDescription>
                                Users invited to this session
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {session.join_tokens && session.join_tokens.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Availability</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {session.join_tokens.map((token) => (
                                            <TableRow key={token.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                                                            {token.user.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <Link to={`/users/${token.user.id}`} className="font-medium text-slate-900 hover:underline">
                                                            {token.user.name}
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500">
                                                    {token.user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {token.user.availability_days?.slice(0, 3).map((day) => (
                                                            <Badge key={day} variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                                                {day.substring(0, 3)}
                                                            </Badge>
                                                        ))}
                                                        {token.user.availability_days?.length > 3 && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                +{token.user.availability_days.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                    <p>No invited users</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
