import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Utensils, UserPlus, Users, X, Calendar, Edit, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { dietPlansService } from '@/lib/diet-plans'
import { usersService } from '@/lib/users'

export function DietPlanDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [userSearch, setUserSearch] = useState('')
    const [unassigningUserId, setUnassigningUserId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const { data: dietPlan, isLoading } = useQuery({
        queryKey: ['diet-plans', id],
        queryFn: () => dietPlansService.getDietPlan(Number(id)),
        enabled: !!id,
    })

    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users', 'all', userSearch],
        queryFn: () => usersService.getUsers(1, 100, userSearch),
        enabled: isAssignDialogOpen,
    })

    const assignMutation = useMutation({
        mutationFn: (userId: string) => dietPlansService.assignDietPlanToUser(userId, Number(id)),
        onSuccess: () => {
            toast.success('Diet plan assigned successfully')
            setIsAssignDialogOpen(false)
            setSelectedUserId('')
            setUserSearch('')
            queryClient.invalidateQueries({ queryKey: ['diet-plans', id] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to assign diet plan')
        },
    })

    const handleAssign = () => {
        if (!selectedUserId) return
        assignMutation.mutate(selectedUserId)
    }

    const unassignMutation = useMutation({
        mutationFn: (userId: number) => dietPlansService.unassignDietPlanFromUser(userId, Number(id)),
        onSuccess: () => {
            toast.success('User unassigned successfully')
            setUnassigningUserId(null)
            queryClient.invalidateQueries({ queryKey: ['diet-plans', id] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to unassign user')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: () => dietPlansService.deleteDietPlan(Number(id)),
        onSuccess: () => {
            toast.success('Diet plan deleted successfully')
            navigate('/diet-plans')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete diet plan')
        },
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        )
    }

    if (!dietPlan) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-900">Diet Plan Not Found</h2>
                <Button variant="link" onClick={() => navigate('/diet-plans')}>
                    Back to List
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/diet-plans')}
                        className="hover:bg-slate-100 shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{dietPlan.name}</h1>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                {dietPlan.daily_calories} kcal
                            </Badge>
                        </div>
                        <p className="text-slate-600 mt-1 max-w-2xl">
                            {dietPlan.description}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAssignDialogOpen(true)} className="shadow-sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign to User
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/diet-plans/${id}/edit`)}
                        className="shadow-sm"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleting(true)}
                        className="shadow-sm hover:bg-red-50 hover:text-red-600 border-slate-200"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Macronutrients */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Macronutrients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <span className="text-sm font-medium text-blue-600 uppercase block mb-1">Protein</span>
                                    <span className="text-2xl font-bold text-blue-700">{dietPlan.macronutrients.protein}g</span>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl text-center">
                                    <span className="text-sm font-medium text-amber-600 uppercase block mb-1">Carbs</span>
                                    <span className="text-2xl font-bold text-amber-700">{dietPlan.macronutrients.carbs}g</span>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl text-center">
                                    <span className="text-sm font-medium text-red-600 uppercase block mb-1">Fats</span>
                                    <span className="text-2xl font-bold text-red-700">{dietPlan.macronutrients.fats}g</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meal Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-slate-500" />
                                Meal Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                                    Breakfast
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap">
                                    {dietPlan.meal_plan.breakfast || 'No suggestions provided.'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                                    Lunch
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap">
                                    {dietPlan.meal_plan.lunch || 'No suggestions provided.'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                                    Dinner
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap">
                                    {dietPlan.meal_plan.dinner || 'No suggestions provided.'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Plan Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm text-slate-500 block">Created On</span>
                                <span className="font-medium">
                                    {dietPlan.created_at ? format(new Date(dietPlan.created_at), 'PPP') : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-slate-500 block">Status</span>
                                <Badge variant="outline" className="mt-1">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Users List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-slate-500" />
                                Assigned Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dietPlan.users && dietPlan.users.length > 0 ? (
                                <div className="space-y-3">
                                    {dietPlan.users.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                                <div
                                                    className="font-medium text-slate-900 hover:text-blue-600 hover:underline cursor-pointer"
                                                    onClick={() => navigate(`/users/${user.id}`)}
                                                >
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {user.pivot?.assigned_at ? format(new Date(user.pivot.assigned_at), 'MMM d, yyyy') : 'No date'}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setUnassigningUserId(user.id)}
                                                title="Unassign User"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500">
                                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm">No users assigned to this plan yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Assignment Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Plan to User</DialogTitle>
                        <DialogDescription>
                            Select a user to assign the <strong>{dietPlan.name}</strong> plan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Search User</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search by name, email or phone..."
                                    className="pl-9"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-select">Select User</Label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger id="user-select">
                                    <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select a user..."} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {usersData?.data.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name} ({user.phone})
                                        </SelectItem>
                                    ))}
                                    {usersData?.data.length === 0 && (
                                        <div className="p-2 text-sm text-slate-500 text-center">No users found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedUserId || assignMutation.isPending}
                        >
                            {assignMutation.isPending ? 'Assigning...' : 'Assign Plan'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Unassign Confirmation Dialog */}
            <Dialog open={!!unassigningUserId} onOpenChange={() => setUnassigningUserId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unassign User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to unassign this user from the diet plan?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUnassigningUserId(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => unassigningUserId && unassignMutation.mutate(unassigningUserId)}
                            disabled={unassignMutation.isPending}
                        >
                            {unassignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Unassign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Diet Plan</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this diet plan? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleting(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
