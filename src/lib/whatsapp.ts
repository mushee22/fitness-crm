import { api } from './api'

export interface BulkSendPayload {
    user_ids: number[]
    message: string
}

export const whatsappService = {
    async bulkSend(payload: BulkSendPayload): Promise<unknown> {
        const response = await api.post('whatsapp/bulk-send', payload)
        return response.data
    },
}
