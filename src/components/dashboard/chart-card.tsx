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
    const hasData = Array.isArray(data) && data.length > 0
    const chartHeight = 300

    return (
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: chartHeight, minHeight: chartHeight }}>
                    {!hasData ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                            <p className="font-medium">No participation data</p>
                            <p className="mt-1">Select a date range or wait for attendance data.</p>
                        </div>
                    ) : (
                <ResponsiveContainer width="100%" height="100%">
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
                                stroke="var(--color-primary)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-primary)', r: 4 }}
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
                            <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
