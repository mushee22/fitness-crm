import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import type { ChartData } from '@/lib/mock-data'

interface ChartCardProps {
    title: string
    data: ChartData[]
    type?: 'line' | 'bar'
}

export function ChartCard({ title, data, type = 'line' }: ChartCardProps) {
    return (
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    {type === 'line' ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                className="text-xs"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                stroke="#cbd5e1"
                            />
                            <YAxis
                                className="text-xs"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                stroke="#cbd5e1"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ fill: '#2563eb', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                className="text-xs"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                stroke="#cbd5e1"
                            />
                            <YAxis
                                className="text-xs"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                stroke="#cbd5e1"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                                }}
                            />
                            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
