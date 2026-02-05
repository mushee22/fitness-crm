import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Utensils } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DietPlanForm } from '@/components/diet-plans/diet-plan-form'
import { dietPlansService, type CreateDietPlanData } from '@/lib/diet-plans'

export function EditDietPlanPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: dietPlan, isLoading } = useQuery({
        queryKey: ['diet-plans', id],
        queryFn: () => dietPlansService.getDietPlan(Number(id)),
        enabled: !!id,
    })

    const updateMutation = useMutation({
        mutationFn: (data: CreateDietPlanData) => dietPlansService.updateDietPlan(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet-plans'] })
            toast.success('Diet plan updated successfully')
            navigate('/diet-plans')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update diet plan')
        },
    })

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-5xl">
                <Skeleton className="h-16 w-full bg-slate-200" />
                <Skeleton className="h-[600px] w-full bg-slate-200" />
            </div>
        )
    }

    if (!dietPlan) {
        return (
            <div className="p-8 text-center text-slate-500">
                Diet plan not found.
                <Button variant="link" onClick={() => navigate('/diet-plans')}>Go back</Button>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/diet-plans')}
                    className="hover:bg-slate-100 shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                            <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Edit Diet Plan</h1>
                            <p className="text-sm sm:text-base text-slate-600 mt-0.5">Modify diet plan details</p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <CardTitle className="text-base sm:text-lg text-slate-900">Edit {dietPlan.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                    <DietPlanForm
                        dietPlan={dietPlan}
                        onSubmit={(data) => updateMutation.mutate(data)}
                        onCancel={() => navigate('/diet-plans')}
                        isLoading={updateMutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
