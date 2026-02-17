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

/** Format an ISO date string as time (e.g. "6:07 PM") in Asia/Kolkata */
export function formatTimeKolkata(iso: string | null | undefined): string {
    if (!iso) return '-'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleString('en-IN', { timeZone: KOLKATA_TZ, hour: 'numeric', minute: '2-digit', hour12: true })
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
