"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User, LogIn } from "lucide-react"
import { useAuth } from "../auth/auth-context"
import Link from "next/link"

interface HeaderProps {
  onLoginClick: () => void
}

export default function Header({ onLoginClick }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <span className="text-2xl">⚽</span>
              Goalfolio
            </h1>
          </Link>
          <p className="text-sm text-gray-600">Football Manager 스타일로 포트폴리오를 구성해보세요</p>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span>{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-1 bg-transparent">
                <LogOut size={16} />
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoginClick}
              className="flex items-center gap-1 bg-transparent"
            >
              <LogIn size={16} />
              로그인
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
