import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideProps } from 'lucide-react'

interface KPICardProps {
    title: string
    value: string | number
    change: number
    icon: React.ComponentType<LucideProps>
    index?: number
}

export function KPICard({ title, value, change, icon: Icon, index = 0 }: KPICardProps) {
    const isPositive = change >= 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="border-slate-200 hover:border-slate-300 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                        {title}
                    </CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-semibold text-slate-900">{value}</div>
                    <p
                        className={cn(
                            'text-xs mt-1 font-medium',
                            isPositive ? 'text-green-600' : 'text-red-600'
                        )}
                    >
                        {isPositive ? '+' : ''}
                        {change}% from last month
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    )
}
