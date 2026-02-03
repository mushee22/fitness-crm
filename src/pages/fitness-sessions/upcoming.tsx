import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon } from 'lucide-react'
import { fitnessSessionsService } from '@/lib/fitness-sessions'
import { UpcomingSessionCard } from '@/components/sessions/upcoming-session-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function UpcomingSessionsPage() {
    const navigate = useNavigate()

    const { data, isLoading, error } = useQuery({
        queryKey: ['fitness-sessions', 'upcoming'],
        queryFn: () => fitnessSessionsService.getUpcomingSessions(15),
    })

    const handleJoinSession = (url: string) => {
        window.open(url, '_blank')
    }

    const handleViewDetails = (id: number) => {
        navigate(`/fitness-sessions/${id}`)
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                <p className="text-red-500 font-medium mb-2">Failed to load upcoming sessions</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Upcoming Sessions</h1>
                    <p className="text-slate-500 mt-1">
                        View and manage your scheduled fitness sessions
                    </p>
                </div>
                <Button onClick={() => navigate('/fitness-sessions')} variant="outline">
                    View All Sessions
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-[280px] rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-8 w-2/3" />
                            <div className="space-y-2 pt-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="pt-8 flex gap-2">
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 flex-1" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : data?.data?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No upcoming sessions</h3>
                    <p className="text-slate-500 mt-1 mb-6 text-center max-w-sm">
                        You don't have any sessions scheduled for the future. Create one to get started.
                    </p>
                    <Button onClick={() => navigate('/fitness-sessions/create')}>
                        Schedule Session
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data?.data?.map((session) => (
                        <UpcomingSessionCard
                            key={session.id}
                            session={session}
                            onJoin={handleJoinSession}
                            onViewDetails={handleViewDetails}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
