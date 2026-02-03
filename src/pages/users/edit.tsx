import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit as EditIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserForm } from '@/components/users/user-form'
import { usersService, type CreateUserData } from '@/lib/users'

export function EditUserPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users', 1],
        queryFn: () => usersService.getUsers(1, 100),
    })

    const user = usersData?.data.find((u) => u.id === Number(id))

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateUserData>) =>
            usersService.updateUser(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success('User updated successfully')
            navigate(`/users/${id}`)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user')
        },
    })

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6 max-w-4xl">
                <Skeleton className="h-16 w-full bg-slate-200" />
                <Skeleton className="h-96 w-full bg-slate-200" />
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

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/users/${id}`)}
                    className="hover:bg-slate-100 flex-shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <EditIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Edit Member</h1>
                            <p className="text-sm sm:text-base text-slate-600 mt-0.5 truncate">Update {user.name}'s information</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <CardTitle className="text-base sm:text-lg text-slate-900">Member Information</CardTitle>
                    <CardDescription className="text-sm">
                        Update the member's details below
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                    <UserForm
                        user={user}
                        onSubmit={(data) => updateMutation.mutate(data)}
                        onCancel={() => navigate(`/users/${id}`)}
                        isLoading={updateMutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
