import { Clock, Users, Video } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FitnessSession } from '@/lib/fitness-sessions'

interface UpcomingSessionCardProps {
    session: FitnessSession
    onJoin?: (url: string) => void
    onViewDetails?: (id: number) => void
}

export function UpcomingSessionCard({ session, onJoin, onViewDetails }: UpcomingSessionCardProps) {
    const startTime = new Date(session.start_time)
    const endTime = new Date(session.end_time)
    const isToday = new Date().toDateString() === new Date(session.date).toDateString()

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-200 border-slate-200 overflow-hidden group">
            <div className="h-2 bg-linear-to-r from-blue-500 to-indigo-600" />
            <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        {isToday && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 mb-2">
                                Today
                            </Badge>
                        )}
                        <h3 className="font-semibold text-lg text-slate-900 leading-tight line-clamp-2">
                            {session.title}
                        </h3>
                    </div>
                    <div className="flex flex-col items-end shrink-0 text-slate-500">
                        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-2 border border-slate-100 w-14">
                            <span className="text-xs font-medium uppercase text-slate-400">
                                {format(new Date(session.date), 'MMM')}
                            </span>
                            <span className="text-xl font-bold text-slate-900">
                                {format(new Date(session.date), 'd')}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-2 grow space-y-4">
                <div className="space-y-2.5">
                    <div className="flex items-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-2.5 text-slate-400 shrink-0" />
                        <span>
                            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-slate-600">
                        <Users className="h-4 w-4 mr-2.5 text-slate-400 shrink-0" />
                        <span>
                            {session.join_tokens?.length || session.user_ids?.length || 0} Participants
                        </span>
                    </div>

                    {session.zoom_join_url && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Video className="h-4 w-4 mr-2.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">Zoom Meeting</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-5 pt-0 mt-auto flex gap-3">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onViewDetails?.(session.id)}
                >
                    View Details
                </Button>
                {session.zoom_join_url && (
                    <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => onJoin?.(session.zoom_join_url!)}
                    >
                        Join Now
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
