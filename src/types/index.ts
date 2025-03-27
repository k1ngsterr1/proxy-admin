export enum UserType {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string
  type: UserType
  email: string
  name?: string
  password?: string
  balance: number | string | any // Handle Decimal type from Prisma
  isVerified: boolean
  ip: string
  isBanned: boolean
  verification_code?: string
  change_password_code?: string
  createdAt: string
  updatedAt: string
  proxyUsage?: string // Additional field for admin panel
}

export interface Proxy {
  id: string
  userId: string
  type: string
  ip: string
  port: number
  username: string
  password: string
  expiresAt: string
  isActive: boolean
}

export interface PromoCode {
  id: string
  code: string
  discount: number
  maxUses: number
  currentUses: number
  expiresAt: string
  isActive: boolean
}

export interface LogEvent {
  id: string
  userId: string
  eventType: string
  description: string
  ipAddress: string
  timestamp: string
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: "deposit" | "withdrawal" | "purchase" | "refund"
  description: string
  timestamp: string
}

export interface Stats {
  totalUsers: number
  activeProxies: number
  totalSales: number
  ordersProcessed: number
}

