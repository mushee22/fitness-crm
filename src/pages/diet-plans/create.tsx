import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Utensils } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DietPlanForm } from '@/components/diet-plans/diet-plan-form'
import { dietPlansService, type CreateDietPlanData } from '@/lib/diet-plans'

export function CreateDietPlanPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: dietPlansService.createDietPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet-plans'] })
            toast.success('Diet plan created successfully')
            navigate('/diet-plans')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create diet plan')
        },
    })

    const handleSubmit = (data: CreateDietPlanData) => {
        createMutation.mutate(data)
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
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Create Diet Plan</h1>
                            <p className="text-sm sm:text-base text-slate-600 mt-0.5">Design a new nutrition plan for your members</p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <CardTitle className="text-base sm:text-lg text-slate-900">Plan Details</CardTitle>
                    <CardDescription className="text-sm">
                        Define calories, macros, and meal suggestions
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                    <DietPlanForm
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/diet-plans')}
                        isLoading={createMutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
