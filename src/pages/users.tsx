import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Eye, Edit, Trash2, Search, Plus, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { usersService, type User } from '@/lib/users'
import { formatDate, getInitials } from '@/lib/utils'

export function UsersPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['users', page],
        queryFn: () => usersService.getUsers(page),
    })

    const deleteMutation = useMutation({
        mutationFn: usersService.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setDeletingUser(null)
            toast.success('User deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete user')
        },
    })

    const filteredUsers = data?.data?.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.user_name && user.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Users</h1>
                    <p className="text-sm sm:text-base text-slate-600 mt-1">Manage gym members and their information</p>
                </div>
                <Button onClick={() => navigate('/users/create')} className="shadow-sm w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-slate-900">All Members</CardTitle>
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, user name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 sm:p-6 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-20 bg-slate-100" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50/30">
                                            <TableHead className="text-slate-700 font-semibold">Member</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">User Name</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Contact</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Blood Group</TableHead>
                                            <TableHead className="text-slate-700 font-semibold">Joined</TableHead>
                                            <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-32 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                        <UserIcon className="h-12 w-12 mb-2 text-slate-300" />
                                                        <p className="font-medium">No users found</p>
                                                        <p className="text-sm">Try adjusting your search</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers?.map((user) => (
                                                    <TableRow
                                                        key={user.id}
                                                        className="border-slate-200 hover:bg-slate-50/50 transition-colors"
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10 border-2 border-slate-200">
                                                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                                                        {getInitials(user.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-slate-900">{user.name}</p>
                                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-700">
                                                            {user.user_name || '—'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <p className="text-sm text-slate-900">{user.phone}</p>
                                                                <p className="text-xs text-slate-500">WhatsApp: {user.whatsapp_number}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-medium">
                                                                {user.blood_group}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {formatDate(user.joined_at)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                    onClick={() => navigate(`/users/${user.id}`)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                                                    onClick={() => navigate(`/users/${user.id}/edit`)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                    onClick={() => setDeletingUser(user)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
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
                                {filteredUsers?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                                        <UserIcon className="h-12 w-12 mb-2 text-slate-300" />
                                        <p className="font-medium">No users found</p>
                                        <p className="text-sm">Try adjusting your search</p>
                                    </div>
                                ) : (
                                    filteredUsers?.map((user) => (
                                            <div key={user.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <Avatar className="h-12 w-12 border-2 border-slate-200">
                                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-slate-900 truncate">{user.name}</h3>
                                                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                                        {user.user_name && (
                                                            <p className="text-xs text-slate-600 mt-0.5">@{user.user_name}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {user.blood_group}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Phone</p>
                                                        <p className="text-slate-900">{user.phone}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Joined</p>
                                                        <p className="text-slate-900">{formatDate(user.joined_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => navigate(`/users/${user.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => navigate(`/users/${user.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setDeletingUser(user)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
                                            className="flex-1 sm:flex-none"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === data.last_page}
                                            className="flex-1 sm:flex-none"
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deletingUser?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeletingUser(null)} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
                            disabled={deleteMutation.isPending}
                            className="w-full sm:w-auto"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
