import * as React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface TimePickerProps {
    value?: string
    onChange: (time: string) => void
    placeholder?: string
    disabled?: boolean
}

export function TimePicker({ value, onChange, placeholder = 'Select time', disabled }: TimePickerProps) {
    const [hours, setHours] = React.useState(value ? value.split(':')[0] : '09')
    const [minutes, setMinutes] = React.useState(value ? value.split(':')[1] : '00')

    React.useEffect(() => {
        if (value) {
            const [h, m] = value.split(':')
            setHours(h)
            setMinutes(m)
        }
    }, [value])

    const handleTimeChange = (newHours: string, newMinutes: string) => {
        setHours(newHours)
        setMinutes(newMinutes)
        onChange(`${newHours}:${newMinutes}`)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-slate-500'
                    )}
                    disabled={disabled}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {value ? value.substring(0, 5) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Hours</label>
                            <select
                                value={hours}
                                onChange={(e) => handleTimeChange(e.target.value, minutes)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                            >
                                {Array.from({ length: 24 }, (_, i) => {
                                    const h = i.toString().padStart(2, '0')
                                    return (
                                        <option key={h} value={h}>
                                            {h}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="text-2xl font-bold text-slate-400 mt-5">:</div>
                        <div className="flex-1">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Minutes</label>
                            <select
                                value={minutes}
                                onChange={(e) => handleTimeChange(hours, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                            >
                                {Array.from({ length: 60 }, (_, i) => {
                                    const m = i.toString().padStart(2, '0')
                                    return (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
