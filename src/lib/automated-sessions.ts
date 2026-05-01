import { api } from './api'

export interface AutomatedSessionRule {
    id: number
    title: string
    start_time: string
    end_time: string
    starts_on: string
    ends_on: string | null
    timezone: string
    is_active: boolean
    last_generated_for_date: string | null
    created_by: number | null
    created_at: string
    updated_at: string
    latest_generated_session?: {
        zoom_join_url?: string | null
    } | null
}

export interface AutomatedSessionRulesListResponse {
    data: AutomatedSessionRule[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface AutomatedSessionRulesFilters {
    is_active?: boolean
    page?: number
    per_page?: number
}

export interface CreateAutomatedSessionRuleData {
    title: string
    start_time: string
    end_time: string
    starts_on: string
    ends_on?: string | null
    is_active: boolean
}

const normalizeRule = (rule: AutomatedSessionRule): AutomatedSessionRule => ({
    ...rule,
    is_active: Boolean((rule as any).is_active),
    last_generated_for_date: rule.last_generated_for_date ?? null,
    created_by: rule.created_by ?? null,
})

const unwrapRulePayload = (responseData: any): AutomatedSessionRule => {
    if (responseData?.data) {
        return normalizeRule(responseData.data as AutomatedSessionRule)
    }
    return normalizeRule(responseData as AutomatedSessionRule)
}

export const automatedSessionsService = {
    async getRules(filters: AutomatedSessionRulesFilters = {}): Promise<AutomatedSessionRulesListResponse> {
        const params = new URLSearchParams()
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0')
        if (filters.page) params.append('page', String(filters.page))
        if (filters.per_page) params.append('per_page', String(filters.per_page))

        const query = params.toString()
        const response = await api.get(query ? `automated-sessions?${query}` : 'automated-sessions')
        const payload = response.data

        return {
            ...payload,
            data: Array.isArray(payload?.data) ? payload.data.map(normalizeRule) : [],
        }
    },

    async getRule(id: number | string): Promise<AutomatedSessionRule> {
        const response = await api.get(`automated-sessions/${id}`)
        return unwrapRulePayload(response.data)
    },

    async createRule(data: CreateAutomatedSessionRuleData): Promise<AutomatedSessionRule> {
        const response = await api.post('automated-sessions', data)
        return unwrapRulePayload(response.data)
    },

    async updateRule(id: number | string, data: Partial<CreateAutomatedSessionRuleData>): Promise<AutomatedSessionRule> {
        const response = await api.patch(`automated-sessions/${id}`, data)
        return unwrapRulePayload(response.data)
    },

    async pauseRule(id: number | string): Promise<void> {
        await api.post(`automated-sessions/${id}/pause`)
    },

    async resumeRule(id: number | string): Promise<void> {
        await api.post(`automated-sessions/${id}/resume`)
    },

    async cancelRule(id: number | string): Promise<void> {
        await api.delete(`automated-sessions/${id}`)
    },
}
