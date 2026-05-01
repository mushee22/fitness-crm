import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount)
}

const KOLKATA_TZ = 'Asia/Kolkata'

/** Format an ISO date string as 12-hour time (e.g. "9:19 PM") in Asia/Kolkata. Handles strings like "2026-02-06T21:19:37+05:30". */
export function formatTimeKolkata(iso: string | null | undefined): string {
    if (!iso) return '-'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleTimeString('en-US', {
        timeZone: KOLKATA_TZ,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

/** Format an ISO date string as date (e.g. "Feb 17, 2026") in Asia/Kolkata */
export function formatDateKolkata(iso: string | null | undefined): string {
    if (!iso) return '-'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('en-IN', { timeZone: KOLKATA_TZ, year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date))
}

function parseTimeToMinutes(time: string): number | null {
    const normalized = time.trim()
    if (!normalized) return null

    // Handle ISO datetime strings like "2026-05-01T00:30:00.000000Z"
    if (normalized.includes('T')) {
        const parsedDate = new Date(normalized)
        if (!isNaN(parsedDate.getTime())) {
            const hhmm = parsedDate.toLocaleTimeString('en-GB', {
                timeZone: 'UTC',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
            const [h, m] = hhmm.split(':').map(Number)
            if (!Number.isNaN(h) && !Number.isNaN(m)) {
                return (h * 60) + m
            }
        }
    }

    const parts = normalized.split(':')
    if (parts.length < 2) return null

    const hours = Number(parts[0])
    const minutes = Number(parts[1])
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
    return (hours * 60) + minutes
}

function minutesToHHmm(totalMinutes: number): string {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440
    const hours = Math.floor(normalized / 60)
    const minutes = normalized % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// Converts a UTC time string (HH:mm or HH:mm:ss) to IST (HH:mm)
export function utcTimeToIstHHmm(time: string | null | undefined): string {
    if (!time) return ''
    const minutes = parseTimeToMinutes(time)
    if (minutes == null) return ''
    return minutesToHHmm(minutes + 330)
}

// Converts an IST time string (HH:mm or HH:mm:ss) to UTC (HH:mm)
export function istTimeToUtcHHmm(time: string | null | undefined): string {
    if (!time) return ''
    const minutes = parseTimeToMinutes(time)
    if (minutes == null) return ''
    return minutesToHHmm(minutes - 330)
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num)
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
