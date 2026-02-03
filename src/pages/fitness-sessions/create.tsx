import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SessionForm } from '@/components/sessions/session-form'
import { fitnessSessionsService, type CreateSessionData } from '@/lib/fitness-sessions'

export function CreateSessionPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: fitnessSessionsService.createSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fitness-sessions'] })
            toast.success('Session created successfully')
            navigate('/fitness-sessions')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create session')
        },
    })

    const handleSubmit = (data: CreateSessionData) => {
        createMutation.mutate(data)
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
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Create Fitness Session</h1>
                            <p className="text-sm sm:text-base text-slate-600 mt-0.5">Schedule a new training session</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <CardTitle className="text-base sm:text-lg text-slate-900">Session Information</CardTitle>
                    <CardDescription className="text-sm">
                        Fill in the details and select participants for the session
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                    <SessionForm
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/fitness-sessions')}
                        isLoading={createMutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
