import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, Plus, Utensils, Eye, UserPlus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
import { dietPlansService, type DietPlan } from '@/lib/diet-plans'
import { usersService } from '@/lib/users'

export function DietPlansPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [deletingPlan, setDeletingPlan] = useState<DietPlan | null>(null)
    const [assigningPlan, setAssigningPlan] = useState<DietPlan | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [userSearch, setUserSearch] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['diet-plans', page],
        queryFn: () => dietPlansService.getDietPlans(page),
    })

    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users', 'all', userSearch],
        queryFn: () => usersService.getUsers(1, 100, userSearch),
        enabled: !!assigningPlan,
    })

    const assignMutation = useMutation({
        mutationFn: (userId: string) => dietPlansService.assignDietPlanToUser(userId, Number(assigningPlan?.id)),
        onSuccess: () => {
            toast.success('Diet plan assigned successfully')
            setAssigningPlan(null)
            setSelectedUserId('')
            setUserSearch('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to assign diet plan')
        },
    })

    const handleAssign = () => {
        if (!selectedUserId || !assigningPlan) return
        assignMutation.mutate(selectedUserId)
    }

    const deleteMutation = useMutation({
        mutationFn: dietPlansService.deleteDietPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet-plans'] })
            setDeletingPlan(null)
            toast.success('Diet plan deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete diet plan')
        },
    })

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Diet Plans</h1>
                    <p className="text-sm sm:text-base text-slate-600 mt-1">Manage diet plans and meals for your members</p>
                </div>
                <Button onClick={() => navigate('/diet-plans/create')} className="shadow-sm w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Diet Plan
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <CardTitle className="text-slate-900">All Plans</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 sm:p-6 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 bg-slate-100" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead className="font-semibold">Plan Name</TableHead>
                                            <TableHead className="font-semibold">Calories</TableHead>
                                            <TableHead className="font-semibold">Macros (P/C/F)</TableHead>
                                            <TableHead className="text-right font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-32 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                        <Utensils className="h-12 w-12 mb-2 text-slate-300" />
                                                        <p className="font-medium">No diet plans found</p>
                                                        <p className="text-sm">Create a new plan to get started</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data?.data.map((plan) => (
                                                <TableRow key={plan.id} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{plan.name}</p>
                                                            <p className="text-sm text-slate-500 truncate max-w-xs">{plan.description}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium">{plan.daily_calories}</span> kcal
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <span className="text-blue-600 font-medium">{plan.macronutrients.protein}p</span> /{' '}
                                                            <span className="text-amber-600 font-medium">{plan.macronutrients.carbs}c</span> /{' '}
                                                            <span className="text-red-600 font-medium">{plan.macronutrients.fats}f</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 hover:bg-slate-100"
                                                                title="Assign to User"
                                                                onClick={() => setAssigningPlan(plan)}
                                                            >
                                                                <UserPlus className="h-4 w-4 text-slate-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 hover:bg-slate-100"
                                                                onClick={() => navigate(`/diet-plans/${plan.id}`)}
                                                            >
                                                                <Eye className="h-4 w-4 text-slate-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 hover:bg-slate-100"
                                                                onClick={() => navigate(`/diet-plans/${plan.id}/edit`)}
                                                            >
                                                                <Edit className="h-4 w-4 text-slate-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 hover:bg-red-50"
                                                                onClick={() => setDeletingPlan(plan)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-200">
                                {data?.data.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        <Utensils className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                        <p className="font-medium">No diet plans found</p>
                                        <p className="text-sm">Create a new plan to get started</p>
                                    </div>
                                ) : (
                                    data?.data.map((plan) => (
                                        <div key={plan.id} className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-slate-900">{plan.name}</h3>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 mt-1">
                                                        {plan.daily_calories} kcal
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 -mt-1"
                                                        onClick={() => setAssigningPlan(plan)}
                                                    >
                                                        <UserPlus className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 -mt-1"
                                                        onClick={() => navigate(`/diet-plans/${plan.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 -mt-1"
                                                        onClick={() => navigate(`/diet-plans/${plan.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 -mt-1 hover:text-red-600"
                                                        onClick={() => setDeletingPlan(plan)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-600 line-clamp-2">
                                                {plan.description}
                                            </p>

                                            <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-2.5">
                                                <div className="flex flex-col items-center flex-1">
                                                    <span className="text-xs uppercase text-slate-400 font-medium">Protein</span>
                                                    <span className="font-medium text-blue-600">{plan.macronutrients.protein}g</span>
                                                </div>
                                                <div className="w-px h-8 bg-slate-200" />
                                                <div className="flex flex-col items-center flex-1">
                                                    <span className="text-xs uppercase text-slate-400 font-medium">Carbs</span>
                                                    <span className="font-medium text-amber-600">{plan.macronutrients.carbs}g</span>
                                                </div>
                                                <div className="w-px h-8 bg-slate-200" />
                                                <div className="flex flex-col items-center flex-1">
                                                    <span className="text-xs uppercase text-slate-400 font-medium">Fats</span>
                                                    <span className="font-medium text-red-600">{plan.macronutrients.fats}g</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {data && data.last_page > 1 && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/30">
                                    <p className="text-sm text-slate-600 text-center sm:text-left">
                                        Page {data.current_page} of {data.last_page} ({data.total} total)
                                    </p>
                                    <div className="flex gap-2 justify-center sm:justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === data.last_page}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Diet Plan</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingPlan?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeletingPlan(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingPlan && deleteMutation.mutate(deletingPlan.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Assignment Dialog */}
            <Dialog open={!!assigningPlan} onOpenChange={(open) => {
                if (!open) {
                    setAssigningPlan(null)
                    setSelectedUserId('')
                    setUserSearch('')
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Plan to User</DialogTitle>
                        <DialogDescription>
                            Select a user to assign the <strong>{assigningPlan?.name}</strong> plan.
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
                            <Label htmlFor="user-select">User</Label>
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
                        <Button variant="outline" onClick={() => setAssigningPlan(null)}>Cancel</Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedUserId || assignMutation.isPending}
                        >
                            {assignMutation.isPending ? 'Assigning...' : 'Assign Plan'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}
