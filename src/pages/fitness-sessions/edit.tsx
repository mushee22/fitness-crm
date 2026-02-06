import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionForm } from '@/components/sessions/session-form'
import { fitnessSessionsService, type CreateSessionData } from '@/lib/fitness-sessions'

export function EditSessionPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: foundSession, isLoading } = useQuery({
        queryKey: ['fitness-sessions', id],
        queryFn: () => fitnessSessionsService.getSession(Number(id)),
        enabled: !!id,
    })

    // Map join_tokens to user_ids if user_ids is missing
    const session = foundSession?.data ? {
        ...foundSession.data,
        user_ids: foundSession.data.user_ids || foundSession.data.join_tokens?.map(t => t.user_id) || []
    } : undefined

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateSessionData>) =>
            fitnessSessionsService.updateSession(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fitness-sessions'] })
            toast.success('Session updated successfully')
            navigate('/fitness-sessions')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update session')
        },
    })

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <Skeleton className="h-16 w-full bg-slate-200" />
                <Skeleton className="h-96 w-full bg-slate-200" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/fitness-sessions')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Session Not Found</h1>
                        <p className="text-sm sm:text-base text-slate-600 mt-1">The requested session could not be found</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/fitness-sessions')}
                    className="hover:bg-slate-100 shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Edit Session</h1>
                            <p className="text-sm sm:text-base text-slate-600 mt-0.5 truncate">Update {session.title}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <CardTitle className="text-base sm:text-lg text-slate-900">Session Information</CardTitle>
                    <CardDescription className="text-sm">
                        Update the session details
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                    <SessionForm
                        session={session}
                        onSubmit={(data) => updateMutation.mutate(data)}
                        onCancel={() => navigate('/fitness-sessions')}
                        isLoading={updateMutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
