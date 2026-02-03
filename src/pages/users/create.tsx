import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserForm } from '@/components/users/user-form'
import { usersService, type CreateUserData } from '@/lib/users'

export function CreateUserPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: usersService.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toast.success('User created successfully')
            navigate('/users')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create user')
        },
    })

    const handleSubmit = (data: CreateUserData) => {
        createMutation.mutate(data)
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/users')}
                    className="hover:bg-slate-100 flex-shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Add New Member</h1>
                            <p className="text-sm sm:text-base text-slate-600 mt-0.5">Create a new gym member account</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <CardTitle className="text-base sm:text-lg text-slate-900">Member Information</CardTitle>
                    <CardDescription className="text-sm">
                        Fill in all the required details to create a new member profile
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                    <UserForm
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/users')}
                        isLoading={createMutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
