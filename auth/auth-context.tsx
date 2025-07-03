"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 로컬 스토리지에서 사용자 정보 로드
  useEffect(() => {
    const savedUser = localStorage.getItem("football-portfolio-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("football-portfolio-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // 실제 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 로컬 스토리지에서 사용자 찾기
    const users = JSON.parse(localStorage.getItem("football-portfolio-users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const userInfo = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt,
      }
      setUser(userInfo)
      localStorage.setItem("football-portfolio-user", JSON.stringify(userInfo))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)

    // 실제 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 기존 사용자 확인
    const users = JSON.parse(localStorage.getItem("football-portfolio-users") || "[]")
    const existingUser = users.find((u: any) => u.email === email)

    if (existingUser) {
      setIsLoading(false)
      return false
    }

    // 새 사용자 생성
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("football-portfolio-users", JSON.stringify(users))

    const userInfo = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    }

    setUser(userInfo)
    localStorage.setItem("football-portfolio-user", JSON.stringify(userInfo))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("football-portfolio-user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
