"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "dmv_auth_user"
const USERS_KEY = "dmv_users"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersRaw = localStorage.getItem(USERS_KEY)
      const users: Array<User & { password: string }> = usersRaw ? JSON.parse(usersRaw) : []
      const found = users.find((u) => u.email === email && u.password === password)
      if (found) {
        const { password: _, ...userData } = found
        setUser(userData)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<boolean> => {
    try {
      const usersRaw = localStorage.getItem(USERS_KEY)
      const users: Array<User & { password: string }> = usersRaw ? JSON.parse(usersRaw) : []
      if (users.find((u) => u.email === email)) {
        return false
      }
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        password,
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
