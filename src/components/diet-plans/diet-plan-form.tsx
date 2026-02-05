import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { DietPlan, CreateDietPlanData } from '@/lib/diet-plans'

interface DietPlanFormProps {
    dietPlan?: DietPlan
    onSubmit: (data: CreateDietPlanData) => void
    onCancel: () => void
    isLoading?: boolean
}

export function DietPlanForm({ dietPlan, onSubmit, onCancel, isLoading }: DietPlanFormProps) {
    const [formData, setFormData] = useState<CreateDietPlanData>({
        name: dietPlan?.name || '',
        description: dietPlan?.description || '',
        daily_calories: dietPlan?.daily_calories || 2000,
        macronutrients: {
            protein: dietPlan?.macronutrients.protein || 0,
            carbs: dietPlan?.macronutrients.carbs || 0,
            fats: dietPlan?.macronutrients.fats || 0,
        },
        meal_plan: {
            breakfast: dietPlan?.meal_plan.breakfast || '',
            lunch: dietPlan?.meal_plan.lunch || '',
            dinner: dietPlan?.meal_plan.dinner || '',
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Plan Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Weight Loss Plan"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the diet plan..."
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            {/* Nutrition Information */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Nutrition Targets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="calories">Daily Calories *</Label>
                        <Input
                            id="calories"
                            type="number"
                            value={formData.daily_calories}
                            onChange={(e) => setFormData({ ...formData, daily_calories: parseInt(e.target.value) || 0 })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="protein">Protein (g) *</Label>
                        <Input
                            id="protein"
                            type="number"
                            value={formData.macronutrients.protein}
                            onChange={(e) => setFormData({
                                ...formData,
                                macronutrients: { ...formData.macronutrients, protein: parseInt(e.target.value) || 0 }
                            })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carbs">Carbs (g) *</Label>
                        <Input
                            id="carbs"
                            type="number"
                            value={formData.macronutrients.carbs}
                            onChange={(e) => setFormData({
                                ...formData,
                                macronutrients: { ...formData.macronutrients, carbs: parseInt(e.target.value) || 0 }
                            })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fats">Fats (g) *</Label>
                        <Input
                            id="fats"
                            type="number"
                            value={formData.macronutrients.fats}
                            onChange={(e) => setFormData({
                                ...formData,
                                macronutrients: { ...formData.macronutrients, fats: parseInt(e.target.value) || 0 }
                            })}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Meal Plan */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Daily Meals
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="breakfast">Breakfast</Label>
                        <Textarea
                            id="breakfast"
                            value={formData.meal_plan.breakfast}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({
                                ...formData,
                                meal_plan: { ...formData.meal_plan, breakfast: e.target.value }
                            })}
                            placeholder="e.g. Oatmeal with fruits"
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lunch">Lunch</Label>
                        <Textarea
                            id="lunch"
                            value={formData.meal_plan.lunch}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({
                                ...formData,
                                meal_plan: { ...formData.meal_plan, lunch: e.target.value }
                            })}
                            placeholder="e.g. Grilled chicken with vegetables"
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dinner">Dinner</Label>
                        <Textarea
                            id="dinner"
                            value={formData.meal_plan.dinner}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({
                                ...formData,
                                meal_plan: { ...formData.meal_plan, dinner: e.target.value }
                            })}
                            placeholder="e.g. Salmon with quinoa"
                            rows={2}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : dietPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
            </div>
        </form>
    )
}
