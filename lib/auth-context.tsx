"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "resident" | "staff" | "admin"

export interface User {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  zip?: string
  role: UserRole
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole }>
  register: (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    city?: string
    zip?: string
    password: string
  }) => Promise<boolean>
  logout: () => void
  resetPassword: (email: string, newPassword: string) => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "dmv_auth_user"
const USERS_KEY = "dmv_users"

// Default admin users (seeded on first load)
const DEFAULT_ADMIN_USERS: Array<User & { password: string }> = [
  {
    id: "admin-001",
    firstName: "System",
    lastName: "Administrator",
    name: "System Administrator",
    email: "admin@dcdmv.gov",
    phone: "202-555-0100",
    role: "admin",
    password: "admin123",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-001",
    firstName: "Staff",
    lastName: "Member",
    name: "Staff Member",
    email: "staff@dcdmv.gov",
    phone: "202-555-0101",
    role: "staff",
    password: "staff123",
    createdAt: new Date().toISOString(),
  },
]

// Seed default users if not present
function seedDefaultUsers() {
  try {
    const usersRaw = localStorage.getItem(USERS_KEY)
    const users: Array<User & { password: string }> = usersRaw ? JSON.parse(usersRaw) : []
    
    let updated = false
    for (const defaultUser of DEFAULT_ADMIN_USERS) {
      const existingUser = users.find((u) => u.email === defaultUser.email)
      if (!existingUser) {
        // Add new default user
        users.push(defaultUser)
        updated = true
      } else if (!existingUser.role) {
        // Fix existing user without role
        existingUser.role = defaultUser.role
        updated = true
      }
    }
    
    if (updated) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Seed default admin/staff users
    seedDefaultUsers()
    
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: UserRole }> => {
    try {
      // Ensure default users are seeded before login attempt
      seedDefaultUsers()
      
      const usersRaw = localStorage.getItem(USERS_KEY)
      const users: Array<User & { password: string; requiresPasswordReset?: boolean }> = usersRaw ? JSON.parse(usersRaw) : []
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
      if (found) {
        const { password: _, ...userData } = found
        setUser(userData)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
        return { success: true, role: found.role }
      }
      return { success: false }
    } catch {
      return { success: false }
    }
  }

  const register = async (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    city?: string
    zip?: string
    password: string
  }): Promise<boolean> => {
    try {
      const usersRaw = localStorage.getItem(USERS_KEY)
      const users: Array<User & { password: string }> = usersRaw ? JSON.parse(usersRaw) : []
      if (users.find((u) => u.email === data.email)) {
        return false
      }
      const newUser = {
        id: crypto.randomUUID(),
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        address: data.address || "",
        city: data.city || "",
        zip: data.zip || "",
        role: "resident" as UserRole,
        password: data.password,
        createdAt: new Date().toISOString(),
      }
      users.push(newUser)
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      const { password: _, ...userData } = newUser
      setUser(userData)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const usersRaw = localStorage.getItem(USERS_KEY)
      const users: Array<User & { password: string }> = usersRaw ? JSON.parse(usersRaw) : []
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (found) {
        // In a real app, this would send an email. For demo, we store a reset token
        const resetTokens = JSON.parse(localStorage.getItem("dmv_password_resets") || "{}")
        resetTokens[email.toLowerCase()] = {
          token: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }
        localStorage.setItem("dmv_password_resets", JSON.stringify(resetTokens))
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const usersRaw = localStorage.getItem(USERS_KEY)
      const users: Array<User & { password: string; requiresPasswordReset?: boolean }> = usersRaw ? JSON.parse(usersRaw) : []
      const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
      if (userIndex !== -1) {
        users[userIndex].password = newPassword
        users[userIndex].requiresPasswordReset = false
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        
        // Clear reset token
        const resetTokens = JSON.parse(localStorage.getItem("dmv_password_resets") || "{}")
        delete resetTokens[email.toLowerCase()]
        localStorage.setItem("dmv_password_resets", JSON.stringify(resetTokens))
        
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPassword, requestPasswordReset, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
