import { useQuery } from '@tanstack/react-query'
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
import { fetchOrders } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'

export function OrdersPage() {
    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
    })

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'success'
            case 'processing':
                return 'default'
            case 'pending':
                return 'warning'
            case 'cancelled':
                return 'destructive'
            default:
                return 'secondary'
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
                <p className="text-slate-600 mt-1">View and manage all orders</p>
            </div>

            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-slate-900">All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 bg-slate-200" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-200">
                                    <TableHead className="text-slate-700">Order ID</TableHead>
                                    <TableHead className="text-slate-700">Customer</TableHead>
                                    <TableHead className="text-slate-700">Product</TableHead>
                                    <TableHead className="text-slate-700">Amount</TableHead>
                                    <TableHead className="text-slate-700">Status</TableHead>
                                    <TableHead className="text-slate-700">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders?.map((order) => (
                                    <TableRow key={order.id} className="border-slate-200">
                                        <TableCell className="font-medium text-slate-900">#{order.id}</TableCell>
                                        <TableCell className="text-slate-600">{order.customer}</TableCell>
                                        <TableCell className="text-slate-600">{order.product}</TableCell>
                                        <TableCell className="text-slate-900 font-medium">{formatCurrency(order.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {formatDate(order.date)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
