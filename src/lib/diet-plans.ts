import { api } from './api'

export interface Macronutrients {
    protein: number
    carbs: number
    fats: number
}

export interface MealPlan {
    breakfast: string
    lunch: string
    dinner: string
}

export interface DietPlan {
    id: number
    name: string
    description: string
    daily_calories: number
    macronutrients: Macronutrients
    meal_plan: MealPlan
    created_at?: string
    updated_at?: string
    users?: {
        id: number
        name: string
        email: string
        phone: string
        pivot?: {
            assigned_at: string
        }
    }[]
    is_active?: boolean
}

export interface DietHistoryItem {
    diet_plan: DietPlan
    assigned_at: string
    ended_at: string | null
    is_active: number
}

export interface DietHistoryResponse {
    data: DietHistoryItem[]
}

export interface CreateDietPlanData {
    name: string
    description: string
    daily_calories: number
    macronutrients: Macronutrients
    meal_plan: MealPlan
}

export interface DietPlansListResponse {
    data: DietPlan[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export const dietPlansService = {
    async getDietPlans(page = 1, perPage = 15): Promise<DietPlansListResponse> {
        const response = await api.get(`diet-plans?page=${page}&per_page=${perPage}`)
        return response.data
    },

    async getDietPlan(id: number): Promise<DietPlan> {
        const response = await api.get(`diet-plans/${id}`)
        return response.data.data
    },

    async createDietPlan(data: CreateDietPlanData): Promise<DietPlan> {
        const response = await api.post('diet-plans', data)
        return response.data
    },

    async updateDietPlan(id: number, data: Partial<CreateDietPlanData>): Promise<DietPlan> {
        const response = await api.put(`diet-plans/${id}`, data)
        return response.data
    },

    async deleteDietPlan(id: number): Promise<void> {
        await api.delete(`diet-plans/${id}`)
    },

    async assignDietPlanToUser(userId: number | string, dietPlanId: number): Promise<void> {
        await api.post(`users/${userId}/diet-plans/assign`, { diet_plan_id: dietPlanId })
    },

    async unassignDietPlanFromUser(userId: number | string, dietPlanId: number): Promise<void> {
        await api.delete(`users/${userId}/diet-plans/${dietPlanId}`)
    },

    async getUserDietHistory(userId: number | string): Promise<DietHistoryResponse> {
        const response = await api.get(`diet-plans/user/${userId}/history`)
        return response.data
    },
}
