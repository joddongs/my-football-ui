"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, FolderOpen, Trash2, Calendar, Users, TrendingUp, Lock } from "lucide-react"
import { useAuth } from "../auth/auth-context"
import { PortfolioStorage, type SavedPortfolio } from "./portfolio-storage"
import type { Player } from "../football-manager"

interface PortfolioManagerProps {
  currentFormation: string
  currentPlayers: Player[]
  onLoadPortfolio: (formation: string, players: Player[]) => void
  onLoginClick: () => void
  onSaveSuccess?: () => void
}

export default function PortfolioManager({
  currentFormation,
  currentPlayers,
  onLoadPortfolio,
  onLoginClick,
  onSaveSuccess,
}: PortfolioManagerProps) {
  const { user } = useAuth()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [portfolioName, setPortfolioName] = useState("")
  const [savedPortfolios, setSavedPortfolios] = useState<SavedPortfolio[]>([])
  const [saveMessage, setSaveMessage] = useState("")

  const loadSavedPortfolios = () => {
    if (user) {
      const portfolios = PortfolioStorage.getPortfolios(user.id)
      setSavedPortfolios(portfolios.filter((p) => p.name !== "자동 저장"))
    }
  }

  const handleSaveClick = () => {
    if (!user) {
      onLoginClick()
      return
    }
    setShowSaveModal(true)
  }

  const handleLoadClick = () => {
    if (!user) {
      onLoginClick()
      return
    }
    loadSavedPortfolios()
    setShowLoadModal(true)
  }

  const handleSave = () => {
    if (!user || !portfolioName.trim()) return

    try {
      PortfolioStorage.savePortfolio(user.id, {
        name: portfolioName.trim(),
        formation: currentFormation,
        players: currentPlayers,
      })

      setSaveMessage("포트폴리오가 성공적으로 저장되었습니다!")
      setPortfolioName("")
      setTimeout(() => {
        setShowSaveModal(false)
        setSaveMessage("")
        onSaveSuccess?.()
      }, 1500)
    } catch (error) {
      setSaveMessage("저장 중 오류가 발생했습니다.")
    }
  }

  const handleLoad = (portfolio: SavedPortfolio) => {
    onLoadPortfolio(portfolio.formation, portfolio.players)
    setShowLoadModal(false)
  }

  const handleDelete = (portfolioId: string) => {
    if (!user) return

    if (confirm("정말로 이 포트폴리오를 삭제하시겠습니까?")) {
      PortfolioStorage.deletePortfolio(user.id, portfolioId)
      loadSavedPortfolios()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculatePortfolioValue = (players: Player[]) => {
    return players.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveClick}
        disabled={currentPlayers.length === 0}
        className="flex items-center gap-1 bg-transparent"
      >
        {!user && <Lock size={14} />}
        <Save size={16} />
        저장
      </Button>

      <Button variant="outline" size="sm" onClick={handleLoadClick} className="flex items-center gap-1 bg-transparent">
        {!user && <Lock size={14} />}
        <FolderOpen size={16} />
        불러오기
      </Button>

      {/* 저장 모달 */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save size={20} />
              포트폴리오 저장
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 space-y-1">
                <div>포메이션: {currentFormation}</div>
                <div>종목 수: {currentPlayers.length}개</div>
                <div>총 가치: ${calculatePortfolioValue(currentPlayers).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <Label htmlFor="portfolio-name">포트폴리오 이름</Label>
              <Input
                id="portfolio-name"
                placeholder="예: 안정형 배당 포트폴리오"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSave()}
              />
            </div>

            {saveMessage && (
              <Alert>
                <AlertDescription>{saveMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!portfolioName.trim()} className="flex-1">
                저장하기
              </Button>
              <Button variant="outline" onClick={() => setShowSaveModal(false)} className="flex-1">
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 불러오기 모달 */}
      <Dialog open={showLoadModal} onOpenChange={setShowLoadModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen size={20} />
              저장된 포트폴리오
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {savedPortfolios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>저장된 포트폴리오가 없습니다.</p>
                <p className="text-sm">현재 포트폴리오를 저장해보세요!</p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {savedPortfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{portfolio.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {portfolio.formation}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {portfolio.players.length}개 종목
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp size={14} />${calculatePortfolioValue(portfolio.players).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar size={12} />
                              {formatDate(portfolio.updatedAt)}
                            </div>
                          </div>

                          {/* 종목 미리보기 */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {portfolio.players.slice(0, 5).map((player, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                              >
                                <span style={{ color: player.color }}>{player.icon}</span>
                                {player.ticker}
                              </span>
                            ))}
                            {portfolio.players.length > 5 && (
                              <span className="text-xs text-gray-500">+{portfolio.players.length - 5}개 더</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 ml-4">
                          <Button size="sm" onClick={() => handleLoad(portfolio)} className="flex items-center gap-1">
                            <FolderOpen size={14} />
                            불러오기
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(portfolio.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
