import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    Activity,
    Droplet,
    Ruler,
    Weight,

    MessageCircle,
    Users,
    Clock,
    AlertTriangle,
    Eye,
    Utensils,
} from 'lucide-react'
import * as React from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usersService } from '@/lib/users'
import { attendanceService, type Attendance } from '@/lib/attendance'
import { analyticsService } from '@/lib/analytics'
import { dietPlansService } from '@/lib/diet-plans'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { formatDate, getInitials } from '@/lib/utils'

export function UserDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users', 1],
        queryFn: () => usersService.getUsers(1, 100),
    })

    const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
        queryKey: ['attendances', 'user', id],
        queryFn: () => attendanceService.getAttendances({ user_id: id }),
        enabled: !!id,
    })

    const { data: attendanceStats, isLoading: loadingStats } = useQuery({
        queryKey: ['attendance-stats', 'user', id],
        queryFn: () => attendanceService.getUserStats(id!),
        enabled: !!id,
    })

    const { data: userAnalytics, isLoading: loadingAnalytics } = useQuery({
        queryKey: ['user-analytics', id],
        queryFn: () => analyticsService.getUserAnalytics(id!),
        enabled: !!id,
    })


    const { data: dietHistoryData, isLoading: loadingDietHistory } = useQuery({
        queryKey: ['diet-plans', 'user', id, 'history'],
        queryFn: () => dietPlansService.getUserDietHistory(id!),
        enabled: !!id,
    })
    const { data: dietPlansData } = useQuery({
        queryKey: ['diet-plans', 'all'],
        queryFn: () => dietPlansService.getDietPlans(1, 100), // Get all plans for selection
    })

    const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false)
    const [selectedDietPlanId, setSelectedDietPlanId] = React.useState<string>('')

    const assignMutation = useMutation({
        mutationFn: (dietPlanId: number) => dietPlansService.assignDietPlanToUser(Number(id), dietPlanId),
        onSuccess: () => {
            toast.success('Diet plan assigned successfully')
            setIsAssignDialogOpen(false)
            setSelectedDietPlanId('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to assign diet plan')
        },
    })

    const handleAssign = () => {
        if (!selectedDietPlanId) return
        assignMutation.mutate(Number(selectedDietPlanId))
    }

    const user = usersData?.data.find((u) => u.id === Number(id))

    const getMembershipStatus = (endDate: string) => {
        const end = new Date(endDate)
        const now = new Date()
        const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysRemaining < 0) return { label: 'Expired', variant: 'destructive' as const }
        if (daysRemaining <= 7) return { label: 'Expiring Soon', variant: 'warning' as const }
        return { label: 'Active', variant: 'success' as const }
    }

    const getStatusBadge = (attendance: Attendance) => {
        if (attendance.attended_fully) return <Badge className="bg-green-500">Attended</Badge>
        if (attendance.early_exit) return <Badge className="bg-orange-500">Left Early</Badge>
        return <Badge variant="secondary">Partial</Badge>
    }

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6 max-w-5xl">
                <Skeleton className="h-16 w-full bg-slate-200" />
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 bg-slate-200" />
                    <Skeleton className="h-64 bg-slate-200" />
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">User Not Found</h1>
                        <p className="text-sm sm:text-base text-slate-600 mt-1">The requested user could not be found</p>
                    </div>
                </div>
            </div>
        )
    }

    const status = getMembershipStatus(user.end_date)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/users')}
                        className="hover:bg-slate-100 shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-slate-200 shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-lg sm:text-xl font-semibold">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">{user.name}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant={status.variant}>{status.label}</Badge>
                                <span className="text-xs sm:text-sm text-slate-500">ID: {user.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAssignDialogOpen(true)} variant="outline" className="shadow-sm w-full sm:w-auto">
                        <Utensils className="h-4 w-4 mr-2" />
                        Assign Diet
                    </Button>
                    <Button onClick={() => navigate(`/users/${id}/edit`)} className="shadow-sm w-full sm:w-auto">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Member
                    </Button>
                </div>
            </div>

            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Diet Plan</DialogTitle>
                        <DialogDescription>
                            Select a diet plan to assign to {user.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="plan">Diet Plan</Label>
                            <Select value={selectedDietPlanId} onValueChange={setSelectedDietPlanId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dietPlansData?.data.map((plan) => (
                                        <SelectItem key={plan.id} value={String(plan.id)}>
                                            {plan.name} ({plan.daily_calories} kcal)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssign} disabled={!selectedDietPlanId || assignMutation.isPending}>
                            {assignMutation.isPending ? 'Assigning...' : 'Assign Plan'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="diet-history">Diet History</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                        {/* Contact Information */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                                <CardTitle className="text-base sm:text-lg text-slate-900 flex items-center gap-2">
                                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-slate-500">Email Address</p>
                                        <p className="text-sm sm:text-base text-slate-900 font-medium truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                        <Phone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-slate-500">Phone Number</p>
                                        <p className="text-sm sm:text-base text-slate-900 font-medium">{user.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                        <MessageCircle className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-slate-500">WhatsApp Number</p>
                                        <p className="text-sm sm:text-base text-slate-900 font-medium">{user.whatsapp_number}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Health Information */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                                <CardTitle className="text-base sm:text-lg text-slate-900 flex items-center gap-2">
                                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                                    Health Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                        <Droplet className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-slate-500">Blood Group</p>
                                        <p className="text-base sm:text-lg text-slate-900 font-medium">{user.blood_group}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                        <Ruler className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-slate-500">Height</p>
                                        <p className="text-base sm:text-lg text-slate-900 font-medium">{user.height_cm} cm</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                        <Weight className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-slate-500">Weight</p>
                                        <p className="text-base sm:text-lg text-slate-900 font-medium">{user.weight_kg} kg</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Membership Information */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                                <CardTitle className="text-base sm:text-lg text-slate-900 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                                    Membership Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                        <CalendarIcon className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-slate-500">Joined Date</p>
                                        <p className="text-sm sm:text-base text-slate-900 font-medium">{formatDate(user.joined_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                        <CalendarIcon className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-slate-500">Membership End Date</p>
                                        <p className="text-sm sm:text-base text-slate-900 font-medium">{formatDate(user.end_date)}</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs sm:text-sm font-medium text-slate-500 mb-2">Status</p>
                                    <Badge variant={status.variant} className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                                        {status.label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Availability */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                                <CardTitle className="text-base sm:text-lg text-slate-900 flex items-center gap-2">
                                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                    Availability Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 sm:pt-6">
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-3">Available Days</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.availability_days.map((day) => (
                                        <Badge
                                            key={day}
                                            variant="secondary"
                                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-blue-50 text-blue-700 border-blue-200"
                                        >
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Stats Cards */}
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Sessions Attended</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">
                                            {loadingStats ? <Skeleton className="h-8 w-12" /> : attendanceStats?.statistics.total_sessions_attended || 0}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-green-50 border-green-100">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Fully Attended</p>
                                        <p className="text-2xl font-bold text-green-700 mt-1">
                                            {loadingStats ? <Skeleton className="h-8 w-12" /> : attendanceStats?.statistics.fully_attended_sessions || 0}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-amber-50 border-amber-100">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Early Exits</p>
                                        <p className="text-2xl font-bold text-amber-700 mt-1">
                                            {loadingStats ? <Skeleton className="h-8 w-12" /> : attendanceStats?.statistics.early_exit_sessions || 0}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-blue-50 border-blue-100">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Avg Duration</p>
                                        <p className="text-2xl font-bold text-blue-700 mt-1">
                                            {loadingStats ? <Skeleton className="h-8 w-16" /> : `${Math.round(attendanceStats?.statistics.average_attendance_duration || 0)}m`}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Session</TableHead>
                                            <TableHead>Join / Leave Time</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingAttendance ? (
                                            [...Array(3)].map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : attendanceData?.data && attendanceData.data.length > 0 ? (
                                            attendanceData.data.map((record) => (
                                                <TableRow
                                                    key={record.id}
                                                >
                                                    <TableCell className="font-medium">
                                                        {format(new Date(record.created_at), 'MMM d, yyyy')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{record.fitness_session?.title || `Session #${record.fitness_session_id}`}</span>
                                                            <Link
                                                                to={`/fitness-sessions/${record.fitness_session_id}`}
                                                                className="text-xs text-blue-600 hover:underline"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                View Session
                                                            </Link>
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
                                                        {getStatusBadge(record)}
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
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    No attendance records found for this user.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-200">
                                {loadingAttendance ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className="p-4 space-y-3">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))
                                ) : attendanceData?.data && attendanceData.data.length > 0 ? (
                                    attendanceData.data.map((record) => (
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
                                                {getStatusBadge(record)}
                                            </div>

                                            <div className="space-y-3">
                                                <div>
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
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/attendance/${record.id}`)}>
                                                    <Eye className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-slate-500">
                                        No attendance records found.
                                    </div>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="diet-history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Diet Plan History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingDietHistory ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-20 w-full" />
                                    ))}
                                </div>
                            ) : dietHistoryData?.data && dietHistoryData.data.length > 0 ? (
                                <div className="space-y-4">
                                    {dietHistoryData.data.map((item) => (
                                        <div key={`${item.diet_plan.id}-${item.assigned_at}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">{item.diet_plan.name}</h3>
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                        {item.diet_plan.daily_calories} kcal
                                                    </Badge>
                                                    {!!item.is_active ? <Badge className="bg-green-500">Active</Badge> : <Badge variant="outline">Ended</Badge>}
                                                </div>
                                                <p className="text-sm text-slate-500 line-clamp-1">{item.diet_plan.description}</p>
                                                <div className="text-xs text-slate-500 flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium text-blue-600">P: {item.diet_plan.macronutrients?.protein || 0}g</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium text-amber-600">C: {item.diet_plan.macronutrients?.carbs || 0}g</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium text-red-600">F: {item.diet_plan.macronutrients?.fats || 0}g</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <span>|</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        <span>Assigned: {format(new Date(item.assigned_at), 'MMM d, yyyy')}</span>
                                                    </div>
                                                    {item.ended_at && (
                                                        <div className="flex items-center gap-1">
                                                            <CalendarIcon className="h-3 w-3" />
                                                            <span>Ended: {format(new Date(item.ended_at), 'MMM d, yyyy')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:mt-0">
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/diet-plans/${item.diet_plan.id}`)}>
                                                    View Plan
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Utensils className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                                    <p className="font-medium">No diet history found</p>
                                    <p className="text-sm">This user hasn't been assigned any diet plans yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sessions Attended</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loadingAnalytics ? <Skeleton className="h-8 w-12" /> : userAnalytics?.attendance_statistics.total_sessions_attended || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Last Attended</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loadingAnalytics ? <Skeleton className="h-8 w-24" /> : userAnalytics?.absence_info.last_attended_at ? format(new Date(userAnalytics.absence_info.last_attended_at), 'MMM d') : '-'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Fully Attended</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loadingAnalytics ? <Skeleton className="h-8 w-12" /> : userAnalytics?.attendance_statistics.fully_attended_sessions || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Missed Streak</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loadingAnalytics ? <Skeleton className="h-8 w-12" /> : userAnalytics?.absence_info.consecutive_missed_days || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Consecutive days</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loadingAnalytics ? <Skeleton className="h-8 w-20" /> : userAnalytics?.attendance_statistics.total_minutes_attended || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Early Exits</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loadingAnalytics ? <Skeleton className="h-8 w-12" /> : userAnalytics?.attendance_statistics.early_exit_sessions || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">{userAnalytics?.attendance_statistics.early_exit_percentage || 0}% of sessions</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loadingAnalytics ? <Skeleton className="h-8 w-12" /> : Math.round(userAnalytics?.attendance_statistics.average_attendance_duration || 0)}m
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    )
}
