import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Bot, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
    automatedSessionsService,
    type AutomatedSessionRule,
    type CreateAutomatedSessionRuleData,
} from '@/lib/automated-sessions'
import { AutomatedSessionRuleForm } from '@/components/automated-sessions/rule-form'
import { RuleActions } from '@/components/automated-sessions/rule-actions'
import { formatDate, utcTimeToIstHHmm } from '@/lib/utils'

type FilterStatus = 'all' | 'active' | 'paused'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]

const normalizeApiErrors = (error: any): Record<string, string> => {
    const errors = error?.response?.data?.errors
    if (!errors || typeof errors !== 'object') return {}

    return Object.entries(errors).reduce((acc, [key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            acc[key] = String(value[0])
        } else if (typeof value === 'string') {
            acc[key] = value
        }
        return acc
    }, {} as Record<string, string>)
}

export function AutomatedSessionsPage() {
    const queryClient = useQueryClient()
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRule, setEditingRule] = useState<AutomatedSessionRule | null>(null)
    const [formApiErrors, setFormApiErrors] = useState<Record<string, string>>({})
    const [activeActionRuleId, setActiveActionRuleId] = useState<number | null>(null)

    const isActiveQueryParam = useMemo(() => {
        if (statusFilter === 'active') return true
        if (statusFilter === 'paused') return false
        return undefined
    }, [statusFilter])

    const { data, isLoading } = useQuery({
        queryKey: ['automated-sessions', statusFilter, page, perPage],
        queryFn: () =>
            automatedSessionsService.getRules({
                is_active: isActiveQueryParam,
                page,
                per_page: perPage,
            }),
    })

    const createMutation = useMutation({
        mutationFn: automatedSessionsService.createRule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automated-sessions'] })
            toast.success('Automated session rule created')
            setFormApiErrors({})
            setIsModalOpen(false)
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to create rule'
            if (error?.response?.status === 422) {
                setFormApiErrors(normalizeApiErrors(error))
            }
            toast.error(message)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateAutomatedSessionRuleData> }) =>
            automatedSessionsService.updateRule(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automated-sessions'] })
            toast.success('Automated session rule updated')
            setFormApiErrors({})
            setEditingRule(null)
            setIsModalOpen(false)
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to update rule'
            if (error?.response?.status === 422) {
                setFormApiErrors(normalizeApiErrors(error))
            }
            toast.error(message)
        },
    })

    const pauseMutation = useMutation({
        mutationFn: (id: number) => automatedSessionsService.pauseRule(id),
        onMutate: (id) => setActiveActionRuleId(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automated-sessions'] })
            toast.success('Rule paused')
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to pause rule')
        },
        onSettled: () => setActiveActionRuleId(null),
    })

    const resumeMutation = useMutation({
        mutationFn: (id: number) => automatedSessionsService.resumeRule(id),
        onMutate: (id) => setActiveActionRuleId(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automated-sessions'] })
            toast.success('Rule resumed')
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to resume rule')
        },
        onSettled: () => setActiveActionRuleId(null),
    })

    const cancelMutation = useMutation({
        mutationFn: (id: number) => automatedSessionsService.cancelRule(id),
        onMutate: (id) => setActiveActionRuleId(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automated-sessions'] })
            toast.success('Rule canceled')
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to cancel rule')
        },
        onSettled: () => setActiveActionRuleId(null),
    })

    const isFormSubmitting = createMutation.isPending || updateMutation.isPending

    const openCreateModal = () => {
        setEditingRule(null)
        setFormApiErrors({})
        setIsModalOpen(true)
    }

    const openEditModal = async (rule: AutomatedSessionRule) => {
        setFormApiErrors({})
        setIsModalOpen(true)
        try {
            const fresh = await automatedSessionsService.getRule(rule.id)
            setEditingRule(fresh)
        } catch {
            setEditingRule(rule)
        }
    }

    const handleSubmitRule = (payload: CreateAutomatedSessionRuleData | Partial<CreateAutomatedSessionRuleData>) => {
        setFormApiErrors({})
        if (editingRule) {
            updateMutation.mutate({ id: editingRule.id, payload })
            return
        }
        createMutation.mutate(payload as CreateAutomatedSessionRuleData)
    }

    const closeModal = () => {
        if (isFormSubmitting) return
        setIsModalOpen(false)
        setEditingRule(null)
        setFormApiErrors({})
    }

    const handleCopyJoinUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success('Zoom join link copied')
        } catch {
            toast.error('Failed to copy link')
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Automated Sessions</h1>
                    <p className="text-sm sm:text-base text-slate-600 mt-1">
                        Create daily recurring rules. The scheduler generates next-day sessions automatically.
                    </p>
                </div>
                <Button className="w-full sm:w-auto" onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-slate-900">Rules</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm text-slate-600">Status</Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value: FilterStatus) => {
                                        setStatusFilter(value)
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="paused">Paused</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-sm text-slate-600">Rows</Label>
                                <Select
                                    value={String(perPage)}
                                    onValueChange={(value) => {
                                        setPerPage(Number(value))
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <SelectItem key={size} value={String(size)}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(4)].map((_, idx) => (
                                <Skeleton key={idx} className="h-14" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead>Title</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Starts On</TableHead>
                                            <TableHead>Ends On</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Generated</TableHead>
                                            <TableHead>Latest Zoom Link</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.data?.length ? (
                                            data.data.map((rule) => (
                                                (() => {
                                                    const latestJoinUrl = rule.latest_generated_session?.zoom_join_url
                                                    return (
                                                <TableRow key={rule.id}>
                                                    <TableCell className="font-medium text-slate-900">{rule.title}</TableCell>
                                                    <TableCell>{utcTimeToIstHHmm(rule.start_time)} - {utcTimeToIstHHmm(rule.end_time)}</TableCell>
                                                    <TableCell>{formatDate(rule.starts_on)}</TableCell>
                                                    <TableCell>{rule.ends_on ? formatDate(rule.ends_on) : 'No end date'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                                            {rule.is_active ? 'Active' : 'Paused'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{rule.last_generated_for_date ? formatDate(rule.last_generated_for_date) : '—'}</TableCell>
                                                    <TableCell>
                                                        {latestJoinUrl ? (
                                                            <div className="flex items-center gap-2">
                                                                <a
                                                                    href={latestJoinUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                                                                >
                                                                    Open
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </a>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-2"
                                                                    onClick={() => handleCopyJoinUrl(latestJoinUrl)}
                                                                >
                                                                    <Copy className="h-3.5 w-3.5 mr-1" />
                                                                    Copy
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <RuleActions
                                                            rule={rule}
                                                            onEdit={openEditModal}
                                                            onPause={(selectedRule) => pauseMutation.mutate(selectedRule.id)}
                                                            onResume={(selectedRule) => resumeMutation.mutate(selectedRule.id)}
                                                            onCancelRule={(selectedRule) => cancelMutation.mutate(selectedRule.id)}
                                                            isMutating={activeActionRuleId === rule.id}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                                    )
                                                })()
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-36 text-center text-slate-500">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <Bot className="h-10 w-10 text-slate-300" />
                                                        <p className="font-medium">No rules found</p>
                                                        <p className="text-sm">Create a rule to start automated scheduling.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="md:hidden divide-y divide-slate-200">
                                {data?.data?.length ? (
                                    data.data.map((rule) => (
                                        (() => {
                                            const latestJoinUrl = rule.latest_generated_session?.zoom_join_url
                                            return (
                                        <div key={rule.id} className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-medium text-slate-900">{rule.title}</h3>
                                                    <p className="text-sm text-slate-600">
                                                        {utcTimeToIstHHmm(rule.start_time)} - {utcTimeToIstHHmm(rule.end_time)}
                                                    </p>
                                                </div>
                                                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                                    {rule.is_active ? 'Active' : 'Paused'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-slate-600 grid grid-cols-2 gap-2">
                                                <p>Starts: {formatDate(rule.starts_on)}</p>
                                                <p>Ends: {rule.ends_on ? formatDate(rule.ends_on) : 'No end'}</p>
                                                <p>Generated: {rule.last_generated_for_date ? formatDate(rule.last_generated_for_date) : '—'}</p>
                                            </div>
                                            {latestJoinUrl && (
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={latestJoinUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                                                    >
                                                        Open latest Zoom link
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-2"
                                                        onClick={() => handleCopyJoinUrl(latestJoinUrl)}
                                                    >
                                                        <Copy className="h-3.5 w-3.5 mr-1" />
                                                        Copy
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="flex justify-end">
                                                <RuleActions
                                                    rule={rule}
                                                    onEdit={openEditModal}
                                                    onPause={(selectedRule) => pauseMutation.mutate(selectedRule.id)}
                                                    onResume={(selectedRule) => resumeMutation.mutate(selectedRule.id)}
                                                    onCancelRule={(selectedRule) => cancelMutation.mutate(selectedRule.id)}
                                                    isMutating={activeActionRuleId === rule.id}
                                                />
                                            </div>
                                        </div>
                                            )
                                        })()
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <Bot className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                        <p className="font-medium">No rules found</p>
                                    </div>
                                )}
                            </div>

                            {data && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/30">
                                    <p className="text-sm text-slate-600 text-center sm:text-left">
                                        Page {data.current_page} of {data.last_page} ({data.total} total)
                                    </p>
                                    <div className="flex gap-2 justify-center sm:justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => p - 1)}
                                            disabled={page <= 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => p + 1)}
                                            disabled={page >= data.last_page}
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

            <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingRule ? 'Update Automated Rule' : 'Create Automated Rule'}</DialogTitle>
                        <DialogDescription>
                            Rules create next-day sessions automatically until paused or canceled.
                        </DialogDescription>
                    </DialogHeader>
                    <AutomatedSessionRuleForm
                        rule={editingRule ?? undefined}
                        onSubmit={handleSubmitRule}
                        onCancel={closeModal}
                        isLoading={isFormSubmitting}
                        apiErrors={formApiErrors}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
