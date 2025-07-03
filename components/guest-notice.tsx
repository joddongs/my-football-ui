"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Info, Save } from "lucide-react"

interface GuestNoticeProps {
  onLoginClick: () => void
}

export default function GuestNotice({ onLoginClick }: GuestNoticeProps) {
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-blue-800">
          현재 <strong>게스트 모드</strong>로 이용 중입니다. 포트폴리오를 저장하고 관리하려면 로그인이 필요합니다.
        </span>
        <Button size="sm" onClick={onLoginClick} className="ml-4 bg-blue-600 hover:bg-blue-700">
          <Save size={14} className="mr-1" />
          로그인하고 저장하기
        </Button>
      </AlertDescription>
    </Alert>
  )
}
