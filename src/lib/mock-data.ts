// Mock data for the admin dashboard

export interface User {
    id: number
    name: string
    email: string
    role: string
    status: 'active' | 'inactive'
    avatar?: string
    createdAt: string
}

export interface Order {
    id: number
    customer: string
    product: string
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    date: string
}

export interface DashboardStats {
    revenue: {
        value: number
        change: number
    }
    users: {
        value: number
        change: number
    }
    orders: {
        value: number
        change: number
    }
    growth: {
        value: number
        change: number
    }
}

export interface ChartData {
    name: string
    value: number
}

export interface Activity {
    id: number
    user: string
    action: string
    timestamp: string
}

// Mock users
export const mockUsers: User[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'active',
        createdAt: '2024-01-15',
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'User',
        status: 'active',
        createdAt: '2024-02-20',
    },
    {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'User',
        status: 'inactive',
        createdAt: '2024-03-10',
    },
    {
        id: 4,
        name: 'Alice Williams',
        email: 'alice@example.com',
        role: 'Manager',
        status: 'active',
        createdAt: '2024-01-25',
    },
    {
        id: 5,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'User',
        status: 'active',
        createdAt: '2024-04-05',
    },
]

// Mock orders
export const mockOrders: Order[] = [
    {
        id: 1001,
        customer: 'John Doe',
        product: 'Premium Plan',
        amount: 299.99,
        status: 'completed',
        date: '2024-01-20',
    },
    {
        id: 1002,
        customer: 'Jane Smith',
        product: 'Basic Plan',
        amount: 99.99,
        status: 'processing',
        date: '2024-01-21',
    },
    {
        id: 1003,
        customer: 'Bob Johnson',
        product: 'Enterprise Plan',
        amount: 599.99,
        status: 'pending',
        date: '2024-01-22',
    },
    {
        id: 1004,
        customer: 'Alice Williams',
        product: 'Premium Plan',
        amount: 299.99,
        status: 'completed',
        date: '2024-01-23',
    },
    {
        id: 1005,
        customer: 'Charlie Brown',
        product: 'Basic Plan',
        amount: 99.99,
        status: 'cancelled',
        date: '2024-01-24',
    },
]

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
    revenue: {
        value: 45231.89,
        change: 20.1,
    },
    users: {
        value: 2350,
        change: 15.3,
    },
    orders: {
        value: 1234,
        change: 8.2,
    },
    growth: {
        value: 12.5,
        change: 4.3,
    },
}

// Mock chart data
export const mockRevenueData: ChartData[] = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
]

export const mockOrdersData: ChartData[] = [
    { name: 'Mon', value: 120 },
    { name: 'Tue', value: 150 },
    { name: 'Wed', value: 180 },
    { name: 'Thu', value: 140 },
    { name: 'Fri', value: 200 },
    { name: 'Sat', value: 160 },
    { name: 'Sun', value: 130 },
]

// Mock recent activity
export const mockRecentActivity: Activity[] = [
    {
        id: 1,
        user: 'John Doe',
        action: 'Created a new order',
        timestamp: '2 minutes ago',
    },
    {
        id: 2,
        user: 'Jane Smith',
        action: 'Updated profile settings',
        timestamp: '15 minutes ago',
    },
    {
        id: 3,
        user: 'Bob Johnson',
        action: 'Cancelled subscription',
        timestamp: '1 hour ago',
    },
    {
        id: 4,
        user: 'Alice Williams',
        action: 'Completed payment',
        timestamp: '2 hours ago',
    },
]

// API simulation functions
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    await delay(500)
    return mockDashboardStats
}

export const fetchUsers = async (): Promise<User[]> => {
    await delay(600)
    return mockUsers
}

export const fetchOrders = async (): Promise<Order[]> => {
    await delay(550)
    return mockOrders
}

export const fetchRevenueData = async (): Promise<ChartData[]> => {
    await delay(400)
    return mockRevenueData
}

export const fetchOrdersData = async (): Promise<ChartData[]> => {
    await delay(400)
    return mockOrdersData
}

export const fetchRecentActivity = async (): Promise<Activity[]> => {
    await delay(450)
    return mockRecentActivity
}
