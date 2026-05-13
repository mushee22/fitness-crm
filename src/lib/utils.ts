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

/**
 * Converts an automated session rule time from the API to HH:mm for native time inputs.
 * ISO strings use the wall clock in Asia/Kolkata. Plain H:mm / HH:mm:ss values are treated as
 * already IST wall clock (typical Laravel time cast), without adding a second UTC→IST offset.
 */
export function automatedRuleTimeToInputHHmm(value: string | null | undefined): string {
    if (!value) return ''
    const trimmed = value.trim()
    if (trimmed.includes('T')) {
        const d = new Date(trimmed)
        if (!Number.isNaN(d.getTime())) {
            const token = d.toLocaleTimeString('en-GB', {
                timeZone: KOLKATA_TZ,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
            const [hStr, mStr] = token.split(':')
            const h = Number(hStr)
            const m = Number(mStr)
            if (!Number.isNaN(h) && !Number.isNaN(m)) {
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
            }
        }
        return ''
    }
    const segments = trimmed.split(':')
    if (segments.length >= 2) {
        const h = Number(segments[0])
        const m = Number(segments[1])
        if (!Number.isNaN(h) && !Number.isNaN(m)) {
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        }
    }
    return ''
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
