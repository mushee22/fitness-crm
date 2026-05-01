import { useState } from 'react'
import { Edit, Pause, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { AutomatedSessionRule } from '@/lib/automated-sessions'

interface RuleActionsProps {
    rule: AutomatedSessionRule
    onEdit: (rule: AutomatedSessionRule) => void
    onPause: (rule: AutomatedSessionRule) => void
    onResume: (rule: AutomatedSessionRule) => void
    onCancelRule: (rule: AutomatedSessionRule) => void
    isMutating?: boolean
}

export function RuleActions({
    rule,
    onEdit,
    onPause,
    onResume,
    onCancelRule,
    isMutating,
}: RuleActionsProps) {
    const [confirmOpen, setConfirmOpen] = useState(false)

    return (
        <div className="flex items-center justify-end gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(rule)}
                disabled={isMutating}
            >
                <Edit className="h-4 w-4" />
            </Button>

            {rule.is_active ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-amber-50 hover:text-amber-700"
                    onClick={() => onPause(rule)}
                    disabled={isMutating}
                >
                    <Pause className="h-4 w-4" />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => onResume(rule)}
                    disabled={isMutating}
                >
                    <Play className="h-4 w-4" />
                </Button>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-50 hover:text-red-700"
                onClick={() => setConfirmOpen(true)}
                disabled={isMutating}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel automated rule?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will stop future auto-generation for "{rule.title}". Existing sessions will not be removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isMutating}>Keep Rule</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            onClick={() => onCancelRule(rule)}
                            disabled={isMutating}
                        >
                            {isMutating ? 'Canceling...' : 'Cancel Rule'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
