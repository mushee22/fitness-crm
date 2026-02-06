import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { MessageCircle, Send, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { usersService } from '@/lib/users'
import { whatsappService } from '@/lib/whatsapp'
import { getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function BulkMessagePage() {
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [message, setMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users', 'bulk-message', 1],
        queryFn: () => usersService.getUsers(1, 500),
    })

    const sendMutation = useMutation({
        mutationFn: (payload: { user_ids: number[]; message: string }) =>
            whatsappService.bulkSend(payload),
        onSuccess: () => {
            toast.success('Bulk message sent successfully')
            setSelectedIds([])
            setMessage('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to send bulk message')
        },
    })

    const users = usersData?.data ?? []
    const filteredUsers = searchQuery.trim()
        ? users.filter(
            (u) =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.user_name && u.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : users

    const toggleUser = (userId: number) => {
        setSelectedIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        )
    }

    const selectAll = () => {
        setSelectedIds(filteredUsers.map((u) => u.id))
    }

    const clearAll = () => {
        setSelectedIds([])
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedMessage = message.trim()
        if (selectedIds.length === 0) {
            toast.error('Please select at least one user')
            return
        }
        if (!trimmedMessage) {
            toast.error('Please enter a message')
            return
        }
        sendMutation.mutate({ user_ids: selectedIds, message: trimmedMessage })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Bulk Message</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                    Send a WhatsApp message to selected users
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                        <CardTitle className="text-base sm:text-lg text-slate-900 flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            Message *
                        </CardTitle>
                        <CardDescription className="text-sm">
                            This message will be sent via WhatsApp to all selected users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Label htmlFor="message" className="sr-only">
                            Message
                        </Label>
                        <textarea
                            id="message"
                            required
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message..."
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle className="text-base sm:text-lg text-slate-900">
                                    Select Users *
                                </CardTitle>
                                <CardDescription className="text-sm mt-1">
                                    Choose the users who will receive the message. At least one user is required.
                                </CardDescription>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                                Select All
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                                Clear All
                            </Button>
                            <span className="text-sm text-slate-600 ml-2">
                                {selectedIds.length} selected
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-14 bg-slate-100" />
                                ))}
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="py-12 text-center text-slate-500">
                                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p className="font-medium">No users found</p>
                                <p className="text-sm">Try adjusting your search</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-200">
                                {filteredUsers.map((user) => (
                                    <label
                                        key={user.id}
                                        className="flex items-center gap-3 p-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(user.id)}
                                            onCheckedChange={() => toggleUser(user.id)}
                                        />
                                        <Avatar className="h-10 w-10 border border-slate-200">
                                            <AvatarFallback className="bg-green-100 text-green-700 text-sm font-medium">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {user.email}
                                            </p>
                                            {user.user_name && (
                                                <p className="text-xs text-slate-600">@{user.user_name}</p>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 shrink-0">
                                            {user.whatsapp_number || user.phone}
                                        </p>
                                    </label>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={
                            sendMutation.isPending ||
                            selectedIds.length === 0 ||
                            !message.trim()
                        }
                        className="min-w-[140px]"
                    >
                        {sendMutation.isPending ? (
                            'Sending...'
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Message
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
