"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Search,
  X,
  Plus,
  Info,
  Users,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Target,
  RefreshCw,
  Wifi,
  WifiOff,
  Star,
  Sparkles,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "./auth/auth-context"
import PortfolioManager from "./portfolio/portfolio-manager"
import { PortfolioStorage } from "./portfolio/portfolio-storage"
import Header from "./components/header"
import GuestNotice from "./components/guest-notice"
import LoginForm from "./auth/login-form"

interface Stock {
  ticker: string
  name: string
  sector: string
  riskLevel: "low" | "medium" | "high"
  color: string
  icon: string
  currentPrice: number
  dividendYield: number
  previousPrice?: number
  priceChange?: number
  priceChangePercent?: number
}

export interface Player {
  id: string
  ticker: string
  name: string
  riskLevel: "low" | "medium" | "high"
  position: { x: number; y: number }
  positionType: "defender" | "midfielder" | "forward"
  shares: number
  purchasePrice: number
  startDate: string
  color: string
  icon: string
  currentPrice: number
  dividendYield: number
  previousPrice?: number
  priceChange?: number
  priceChangePercent?: number
}

interface Formation {
  name: string
  code: string
  positions: {
    defender: { x: number; y: number }[]
    midfielder: { x: number; y: number }[]
    forward: { x: number; y: number }[]
  }
}

interface RecommendedPortfolio {
  name: string
  description: string
  icon: string
  formation: string
  players: Omit<
    Player,
    | "id"
    | "position"
    | "color"
    | "icon"
    | "currentPrice"
    | "dividendYield"
    | "previousPrice"
    | "priceChange"
    | "priceChangePercent"
  >[]
}

// 환율 (실시간 업데이트됨)
const INITIAL_USD_TO_KRW = 1320

// 티커별 색상과 아이콘 정의 (확장)
const getTickerStyle = (ticker: string) => {
  const styles: Record<string, { color: string; icon: string }> = {
    // 기존 종목들
    AAPL: { color: "#007AFF", icon: "🍎" },
    MSFT: { color: "#00BCF2", icon: "🪟" },
    GOOGL: { color: "#4285F4", icon: "🔍" },
    TSLA: { color: "#CC0000", icon: "⚡" },
    NVDA: { color: "#76B900", icon: "🎮" },
    BTC: { color: "#F7931A", icon: "₿" },
    ETH: { color: "#627EEA", icon: "♦" },
    SPY: { color: "#1f77b4", icon: "📊" },
    QQQ: { color: "#ff7f0e", icon: "📈" },
    JNJ: { color: "#d62728", icon: "🏥" },
    PG: { color: "#2ca02c", icon: "🧴" },
    KO: { color: "#FF0000", icon: "🥤" },
    AMZN: { color: "#FF9900", icon: "📦" },
    META: { color: "#1877F2", icon: "👥" },
    NFLX: { color: "#E50914", icon: "🎬" },
    V: { color: "#1A1F71", icon: "💳" },
    JPM: { color: "#0066CC", icon: "🏦" },
    WMT: { color: "#004C91", icon: "🛒" },

    // 새로 추가된 종목들
    SCHD: { color: "#8B4513", icon: "💎" },
    CPNG: { color: "#FF6B35", icon: "🛍️" },
    AMD: { color: "#ED1C24", icon: "🔥" },
    CRM: { color: "#00A1E0", icon: "☁️" },
    UBER: { color: "#000000", icon: "🚗" },
    ABNB: { color: "#FF5A5F", icon: "🏠" },
    COIN: { color: "#0052FF", icon: "🪙" },
    PLTR: { color: "#101010", icon: "🔍" },
    SNOW: { color: "#29B5E8", icon: "❄️" },
    ROKU: { color: "#662D91", icon: "📺" },
    SQ: { color: "#3E4348", icon: "💳" },
    PYPL: { color: "#003087", icon: "💰" },
    DIS: { color: "#113CCF", icon: "🏰" },
    BA: { color: "#0039A6", icon: "✈️" },
    GE: { color: "#005EB8", icon: "⚡" },
    F: { color: "#003478", icon: "🚙" },
    GM: { color: "#005DAA", icon: "🚗" },
    T: { color: "#00A8E6", icon: "📱" },
    VZ: { color: "#CD040B", icon: "📶" },
    XOM: { color: "#FF1B2D", icon: "🛢️" },
    CVX: { color: "#003DA5", icon: "⛽" },
    INTC: { color: "#0071C5", icon: "💻" },
    IBM: { color: "#1F70C1", icon: "🔵" },
    ORCL: { color: "#F80000", icon: "🗄️" },
    ADBE: { color: "#FF0000", icon: "🎨" },
    SPOT: { color: "#1DB954", icon: "🎵" },
    TWTR: { color: "#1DA1F2", icon: "🐦" },
    SNAP: { color: "#FFFC00", icon: "👻" },
    ZM: { color: "#2D8CFF", icon: "📹" },
    DOCU: { color: "#003E51", icon: "📝" },
    SHOP: { color: "#95BF47", icon: "🛒" },
    TWLO: { color: "#F22F46", icon: "💬" },
    OKTA: { color: "#007DC1", icon: "🔐" },
    CRWD: { color: "#E01E5A", icon: "🛡️" },
    ZS: { color: "#318CE7", icon: "🔒" },
    NET: { color: "#F38020", icon: "☁️" },
    DDOG: { color: "#632CA6", icon: "🐕" },
    MDB: { color: "#00ED64", icon: "🍃" },
    TEAM: { color: "#0052CC", icon: "👥" },
    NOW: { color: "#81B5A1", icon: "⚙️" },
    WDAY: { color: "#F68D2E", icon: "👔" },
    VEEV: { color: "#FF6900", icon: "💊" },
    ZEN: { color: "#03363D", icon: "🎧" },
  }

  return styles[ticker] || { color: "#6B7280", icon: "💼" }
}

// 초기 주식 데이터베이스
const initialStockData: Omit<Stock, "previousPrice" | "priceChange" | "priceChangePercent">[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    riskLevel: "low",
    currentPrice: 195.89,
    dividendYield: 0.43,
    ...getTickerStyle("AAPL"),
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    sector: "Technology",
    riskLevel: "low",
    currentPrice: 415.26,
    dividendYield: 0.68,
    ...getTickerStyle("MSFT"),
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    riskLevel: "medium",
    currentPrice: 175.32,
    dividendYield: 0.0,
    ...getTickerStyle("GOOGL"),
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    riskLevel: "high",
    currentPrice: 248.98,
    dividendYield: 0.0,
    ...getTickerStyle("TSLA"),
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    sector: "Technology",
    riskLevel: "high",
    currentPrice: 140.15,
    dividendYield: 0.03,
    ...getTickerStyle("NVDA"),
  },
  {
    ticker: "BTC",
    name: "Bitcoin",
    sector: "Cryptocurrency",
    riskLevel: "high",
    currentPrice: 97250.0,
    dividendYield: 0.0,
    ...getTickerStyle("BTC"),
  },
  {
    ticker: "ETH",
    name: "Ethereum",
    sector: "Cryptocurrency",
    riskLevel: "high",
    currentPrice: 3420.5,
    dividendYield: 0.0,
    ...getTickerStyle("ETH"),
  },
  {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF",
    sector: "ETF",
    riskLevel: "medium",
    currentPrice: 595.38,
    dividendYield: 1.23,
    ...getTickerStyle("SPY"),
  },
  {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    sector: "ETF",
    riskLevel: "medium",
    currentPrice: 515.67,
    dividendYield: 0.51,
    ...getTickerStyle("QQQ"),
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    riskLevel: "low",
    currentPrice: 148.92,
    dividendYield: 3.05,
    ...getTickerStyle("JNJ"),
  },
  {
    ticker: "PG",
    name: "Procter & Gamble",
    sector: "Consumer Goods",
    riskLevel: "low",
    currentPrice: 165.43,
    dividendYield: 2.31,
    ...getTickerStyle("PG"),
  },
  {
    ticker: "KO",
    name: "Coca-Cola",
    sector: "Beverages",
    riskLevel: "low",
    currentPrice: 62.84,
    dividendYield: 2.96,
    ...getTickerStyle("KO"),
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    sector: "E-commerce",
    riskLevel: "medium",
    currentPrice: 215.44,
    dividendYield: 0.0,
    ...getTickerStyle("AMZN"),
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    sector: "Social Media",
    riskLevel: "medium",
    currentPrice: 563.92,
    dividendYield: 0.37,
    ...getTickerStyle("META"),
  },
  {
    ticker: "NFLX",
    name: "Netflix Inc.",
    sector: "Entertainment",
    riskLevel: "medium",
    currentPrice: 875.43,
    dividendYield: 0.0,
    ...getTickerStyle("NFLX"),
  },
  {
    ticker: "V",
    name: "Visa Inc.",
    sector: "Financial",
    riskLevel: "low",
    currentPrice: 312.67,
    dividendYield: 0.69,
    ...getTickerStyle("V"),
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    sector: "Banking",
    riskLevel: "medium",
    currentPrice: 245.18,
    dividendYield: 2.05,
    ...getTickerStyle("JPM"),
  },
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    sector: "Retail",
    riskLevel: "low",
    currentPrice: 95.84,
    dividendYield: 2.87,
    ...getTickerStyle("WMT"),
  },
  {
    ticker: "SCHD",
    name: "Schwab US Dividend Equity ETF",
    sector: "ETF",
    riskLevel: "low",
    currentPrice: 82.45,
    dividendYield: 3.47,
    ...getTickerStyle("SCHD"),
  },
  {
    ticker: "CPNG",
    name: "Coupang Inc.",
    sector: "E-commerce",
    riskLevel: "high",
    currentPrice: 24.67,
    dividendYield: 0.0,
    ...getTickerStyle("CPNG"),
  },
]

// 추천 포트폴리오 정의
const recommendedPortfolios: RecommendedPortfolio[] = [
  {
    name: "안정형 배당 포트폴리오",
    description: "안정적인 배당 수익을 추구하는 보수적 투자자를 위한 포트폴리오",
    icon: "🛡️",
    formation: "533",
    players: [
      // 수비수 (5명) - 안정적인 배당주와 채권형 ETF
      {
        ticker: "SCHD",
        name: "Schwab US Dividend Equity ETF",
        riskLevel: "low",
        positionType: "defender",
        shares: 50,
        purchasePrice: 82.45,
        startDate: "2024-01-01",
      },
      {
        ticker: "JNJ",
        name: "Johnson & Johnson",
        riskLevel: "low",
        positionType: "defender",
        shares: 30,
        purchasePrice: 148.92,
        startDate: "2024-01-01",
      },
      {
        ticker: "PG",
        name: "Procter & Gamble",
        riskLevel: "low",
        positionType: "defender",
        shares: 25,
        purchasePrice: 165.43,
        startDate: "2024-01-01",
      },
      {
        ticker: "KO",
        name: "Coca-Cola",
        riskLevel: "low",
        positionType: "defender",
        shares: 60,
        purchasePrice: 62.84,
        startDate: "2024-01-01",
      },
      {
        ticker: "V",
        name: "Visa Inc.",
        riskLevel: "low",
        positionType: "defender",
        shares: 15,
        purchasePrice: 312.67,
        startDate: "2024-01-01",
      },

      // 미드필더 (3명) - 대형 우량주
      {
        ticker: "AAPL",
        name: "Apple Inc.",
        riskLevel: "low",
        positionType: "midfielder",
        shares: 20,
        purchasePrice: 195.89,
        startDate: "2024-01-01",
      },
      {
        ticker: "MSFT",
        name: "Microsoft Corp.",
        riskLevel: "low",
        positionType: "midfielder",
        shares: 10,
        purchasePrice: 415.26,
        startDate: "2024-01-01",
      },
      {
        ticker: "SPY",
        name: "SPDR S&P 500 ETF",
        riskLevel: "medium",
        positionType: "midfielder",
        shares: 25,
        purchasePrice: 595.38,
        startDate: "2024-01-01",
      },

      // 공격수 (3명) - 성장주
      {
        ticker: "GOOGL",
        name: "Alphabet Inc.",
        riskLevel: "medium",
        positionType: "forward",
        shares: 15,
        purchasePrice: 175.32,
        startDate: "2024-01-01",
      },
      {
        ticker: "META",
        name: "Meta Platforms Inc.",
        riskLevel: "medium",
        positionType: "forward",
        shares: 5,
        purchasePrice: 563.92,
        startDate: "2024-01-01",
      },
      {
        ticker: "AMZN",
        name: "Amazon.com Inc.",
        riskLevel: "medium",
        positionType: "forward",
        shares: 12,
        purchasePrice: 215.44,
        startDate: "2024-01-01",
      },
    ],
  },
  {
    name: "성장형 테크 포트폴리오",
    description: "높은 성장 잠재력을 추구하는 적극적 투자자를 위한 포트폴리오",
    icon: "🚀",
    formation: "452",
    players: [
      // 수비수 (4명) - 안정적인 대형주
      {
        ticker: "AAPL",
        name: "Apple Inc.",
        riskLevel: "low",
        positionType: "defender",
        shares: 25,
        purchasePrice: 195.89,
        startDate: "2024-01-01",
      },
      {
        ticker: "MSFT",
        name: "Microsoft Corp.",
        riskLevel: "low",
        positionType: "defender",
        shares: 12,
        purchasePrice: 415.26,
        startDate: "2024-01-01",
      },
      {
        ticker: "SPY",
        name: "SPDR S&P 500 ETF",
        riskLevel: "medium",
        positionType: "defender",
        shares: 20,
        purchasePrice: 595.38,
        startDate: "2024-01-01",
      },
      {
        ticker: "QQQ",
        name: "Invesco QQQ Trust",
        riskLevel: "medium",
        positionType: "defender",
        shares: 15,
        purchasePrice: 515.67,
        startDate: "2024-01-01",
      },

      // 미드필더 (5명) - 성장주와 테크주
      {
        ticker: "NVDA",
        name: "NVIDIA Corp.",
        riskLevel: "high",
        positionType: "midfielder",
        shares: 30,
        purchasePrice: 140.15,
        startDate: "2024-01-01",
      },
      {
        ticker: "GOOGL",
        name: "Alphabet Inc.",
        riskLevel: "medium",
        positionType: "midfielder",
        shares: 20,
        purchasePrice: 175.32,
        startDate: "2024-01-01",
      },
      {
        ticker: "META",
        name: "Meta Platforms Inc.",
        riskLevel: "medium",
        positionType: "midfielder",
        shares: 8,
        purchasePrice: 563.92,
        startDate: "2024-01-01",
      },
      {
        ticker: "AMZN",
        name: "Amazon.com Inc.",
        riskLevel: "medium",
        positionType: "midfielder",
        shares: 15,
        purchasePrice: 215.44,
        startDate: "2024-01-01",
      },
      {
        ticker: "NFLX",
        name: "Netflix Inc.",
        riskLevel: "medium",
        positionType: "midfielder",
        shares: 4,
        purchasePrice: 875.43,
        startDate: "2024-01-01",
      },

      // 공격수 (2명) - 고성장 종목
      {
        ticker: "TSLA",
        name: "Tesla Inc.",
        riskLevel: "high",
        positionType: "forward",
        shares: 15,
        purchasePrice: 248.98,
        startDate: "2024-01-01",
      },
      {
        ticker: "CPNG",
        name: "Coupang Inc.",
        riskLevel: "high",
        positionType: "forward",
        shares: 80,
        purchasePrice: 24.67,
        startDate: "2024-01-01",
      },
    ],
  },
]

// 다양한 포메이션 정의 (골키퍼 제거, 수비수로 통합)
const formations: Formation[] = [
  {
    name: "5-3-3",
    code: "533",
    positions: {
      defender: [
        { x: 50, y: 85 }, // 기존 골키퍼 위치
        { x: 15, y: 70 },
        { x: 38, y: 65 },
        { x: 62, y: 65 },
        { x: 85, y: 70 },
      ],
      midfielder: [
        { x: 25, y: 45 },
        { x: 50, y: 40 },
        { x: 75, y: 45 },
      ],
      forward: [
        { x: 30, y: 20 },
        { x: 50, y: 15 },
        { x: 70, y: 20 },
      ],
    },
  },
  {
    name: "5-4-2",
    code: "542",
    positions: {
      defender: [
        { x: 50, y: 85 }, // 기존 골키퍼 위치
        { x: 15, y: 70 },
        { x: 38, y: 65 },
        { x: 62, y: 65 },
        { x: 85, y: 70 },
      ],
      midfielder: [
        { x: 15, y: 45 },
        { x: 38, y: 40 },
        { x: 62, y: 40 },
        { x: 85, y: 45 },
      ],
      forward: [
        { x: 35, y: 20 },
        { x: 65, y: 20 },
      ],
    },
  },
  {
    name: "4-5-2",
    code: "452",
    positions: {
      defender: [
        { x: 50, y: 85 }, // 기존 골키퍼 위치
        { x: 25, y: 70 },
        { x: 50, y: 65 },
        { x: 75, y: 70 },
      ],
      midfielder: [
        { x: 15, y: 50 },
        { x: 35, y: 40 },
        { x: 50, y: 35 },
        { x: 65, y: 40 },
        { x: 85, y: 50 },
      ],
      forward: [
        { x: 35, y: 20 },
        { x: 65, y: 20 },
      ],
    },
  },
  {
    name: "5-2-3-1",
    code: "5231",
    positions: {
      defender: [
        { x: 50, y: 85 }, // 기존 골키퍼 위치
        { x: 15, y: 70 },
        { x: 38, y: 65 },
        { x: 62, y: 65 },
        { x: 85, y: 70 },
      ],
      midfielder: [
        { x: 35, y: 50 },
        { x: 65, y: 50 },
        { x: 25, y: 30 },
        { x: 50, y: 25 },
        { x: 75, y: 30 },
      ],
      forward: [{ x: 50, y: 15 }],
    },
  },
]

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "low":
      return "bg-green-500"
    case "medium":
      return "bg-yellow-500"
    case "high":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getRiskBadgeColor = (risk: string) => {
  switch (risk) {
    case "low":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "high":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// 포지션별 파이차트 색상
const POSITION_COLORS = {
  defender: "#22c55e",
  midfielder: "#eab308",
  forward: "#ef4444",
}

export default function FootballManager() {
  const { user } = useAuth()
  const [players, setPlayers] = useState<Player[]>([])
  const [stockDatabase, setStockDatabase] = useState<Stock[]>(
    initialStockData.map((stock) => ({
      ...stock,
      previousPrice: stock.currentPrice,
      priceChange: 0,
      priceChangePercent: 0,
    })),
  )
  const [usdToKrw, setUsdToKrw] = useState(INITIAL_USD_TO_KRW)
  const [currentFormation, setCurrentFormation] = useState<Formation>(formations[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [modalSearchTerm, setModalSearchTerm] = useState("")
  const [draggedStock, setDraggedStock] = useState<Stock | null>(null)
  const [dropZone, setDropZone] = useState<string | null>(null)
  const [showInvestmentModal, setShowInvestmentModal] = useState(false)
  const [showStockSelectModal, setShowStockSelectModal] = useState(false)
  const [showRecommendedPortfolioModal, setShowRecommendedPortfolioModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<{
    positionType: string
    slotIndex: number
    stock?: Stock
  } | null>(null)
  const [shares, setShares] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [startDate, setStartDate] = useState("")
  const [customRiskLevel, setCustomRiskLevel] = useState<"low" | "medium" | "high">("medium")
  const [expandedPositionGroups, setExpandedPositionGroups] = useState<Record<string, boolean>>({
    defender: false,
    midfielder: false,
    forward: false,
  })
  const [showKRW, setShowKRW] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connected")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  // 자동 저장 기능 (로그인된 사용자만)
  useEffect(() => {
    if (user && players.length > 0) {
      const timeoutId = setTimeout(() => {
        PortfolioStorage.autoSave(user.id, "자동 저장", currentFormation.code, players)
      }, 2000) // 2초 후 자동 저장

      return () => clearTimeout(timeoutId)
    }
  }, [user, players, currentFormation])

  // 컴포넌트 마운트 시 자동 저장된 포트폴리오 로드 (로그인된 사용자만)
  useEffect(() => {
    if (user) {
      const autoSaved = PortfolioStorage.getPortfolios(user.id).find((p) => p.name === "자동 저장")
      if (autoSaved && autoSaved.players.length > 0) {
        const targetFormation = formations.find((f) => f.code === autoSaved.formation)
        if (targetFormation) {
          setCurrentFormation(targetFormation)
          setPlayers(autoSaved.players)
        }
      }
    }
  }, [user])

  const handleLoadPortfolio = (formation: string, players: Player[]) => {
    const targetFormation = formations.find((f) => f.code === formation)
    if (targetFormation) {
      setCurrentFormation(targetFormation)
      setPlayers(players)
    }
  }

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setShares(player.shares.toString())
    setPurchasePrice(player.purchasePrice.toString())
    setStartDate(player.startDate)
    setCustomRiskLevel(player.riskLevel)
    setShowEditModal(true)
  }

  const handleUpdatePlayer = () => {
    if (editingPlayer && shares && purchasePrice && startDate) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === editingPlayer.id
            ? {
                ...p,
                shares: Number.parseFloat(shares),
                purchasePrice: Number.parseFloat(purchasePrice),
                startDate: startDate,
                riskLevel: customRiskLevel,
              }
            : p,
        ),
      )

      setShowEditModal(false)
      setEditingPlayer(null)
      setShares("")
      setPurchasePrice("")
      setStartDate("")
    }
  }

  // 실시간 데이터 업데이트 함수
  const updateMarketData = useCallback(async () => {
    setIsLoading(true)
    setConnectionStatus("connecting")

    try {
      // 실제 API 호출을 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 주가 업데이트 (±5% 범위에서 랜덤 변동)
      setStockDatabase((prevStocks) =>
        prevStocks.map((stock) => {
          const changePercent = (Math.random() - 0.5) * 10 // -5% ~ +5%
          const newPrice = stock.currentPrice * (1 + changePercent / 100)
          const priceChange = newPrice - stock.currentPrice

          return {
            ...stock,
            previousPrice: stock.currentPrice,
            currentPrice: Math.max(0.01, Number(newPrice.toFixed(2))),
            priceChange: Number(priceChange.toFixed(2)),
            priceChangePercent: Number(changePercent.toFixed(2)),
          }
        }),
      )

      // 환율 업데이트 (±2% 범위에서 랜덤 변동)
      setUsdToKrw((prevRate) => {
        const changePercent = (Math.random() - 0.5) * 4 // -2% ~ +2%
        const newRate = prevRate * (1 + changePercent / 100)
        return Math.max(1000, Math.round(newRate))
      })

      // 플레이어 데이터도 업데이트
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => {
          const updatedStock = stockDatabase.find((stock) => stock.ticker === player.ticker)
          if (updatedStock) {
            return {
              ...player,
              previousPrice: player.currentPrice,
              currentPrice: updatedStock.currentPrice,
              priceChange: updatedStock.priceChange,
              priceChangePercent: updatedStock.priceChangePercent,
            }
          }
          return player
        }),
      )

      setLastUpdateTime(new Date())
      setConnectionStatus("connected")
    } catch (error) {
      console.error("Failed to update market data:", error)
      setConnectionStatus("disconnected")
    } finally {
      setIsLoading(false)
    }
  }, [stockDatabase])

  // 자동 새로고침 설정 (기본 ON, UI 제거)
  useEffect(() => {
    const interval = setInterval(() => {
      updateMarketData()
    }, 30000) // 30초마다 업데이트

    return () => clearInterval(interval)
  }, [updateMarketData])

  // 수동 새로고침
  const handleManualRefresh = () => {
    updateMarketData()
  }

  // 추천 포트폴리오 적용
  const applyRecommendedPortfolio = (portfolio: RecommendedPortfolio) => {
    // 포메이션 변경
    const targetFormation = formations.find((f) => f.code === portfolio.formation)
    if (targetFormation) {
      setCurrentFormation(targetFormation)
    }

    // 플레이어 생성
    const newPlayers: Player[] = portfolio.players
      .map((playerTemplate, index) => {
        const stock = stockDatabase.find((s) => s.ticker === playerTemplate.ticker)
        if (!stock) return null

        const positionType = playerTemplate.positionType
        const positionIndex = portfolio.players.filter((p) => p.positionType === positionType).indexOf(playerTemplate)
        const position = targetFormation?.positions[positionType][positionIndex] || { x: 50, y: 50 }

        return {
          id: `${positionType}-${positionIndex}`,
          ticker: playerTemplate.ticker,
          name: playerTemplate.name,
          riskLevel: playerTemplate.riskLevel,
          position: position,
          positionType: playerTemplate.positionType,
          shares: playerTemplate.shares,
          purchasePrice: playerTemplate.purchasePrice,
          startDate: playerTemplate.startDate,
          color: stock.color,
          icon: stock.icon,
          currentPrice: stock.currentPrice,
          dividendYield: stock.dividendYield,
          previousPrice: stock.currentPrice,
          priceChange: 0,
          priceChangePercent: 0,
        }
      })
      .filter(Boolean) as Player[]

    setPlayers(newPlayers)
    setShowRecommendedPortfolioModal(false)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length > 0) {
      const results = stockDatabase.filter(
        (stock) =>
          stock.ticker.toLowerCase().includes(term.toLowerCase()) ||
          stock.name.toLowerCase().includes(term.toLowerCase()),
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const getFilteredStocks = () => {
    if (modalSearchTerm.length > 0) {
      return stockDatabase.filter(
        (stock) =>
          stock.ticker.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(modalSearchTerm.toLowerCase()),
      )
    }
    return stockDatabase
  }

  const handleFormationChange = (formationCode: string) => {
    const newFormation = formations.find((f) => f.code === formationCode)
    if (newFormation) {
      setCurrentFormation(newFormation)
      setPlayers([])
    }
  }

  const handleDragStart = (stock: Stock) => {
    setDraggedStock(stock)
  }

  const handleDragOver = (e: React.DragEvent, positionType: string) => {
    e.preventDefault()
    setDropZone(positionType)
  }

  const handleDragLeave = () => {
    setDropZone(null)
  }

  const handleDrop = (e: React.DragEvent, positionType: string, slotIndex: number) => {
    e.preventDefault()
    setDropZone(null)

    if (draggedStock) {
      setSelectedPosition({ positionType, slotIndex, stock: draggedStock })
      setCustomRiskLevel(draggedStock.riskLevel)
      setPurchasePrice(draggedStock.currentPrice.toString())
      setShowInvestmentModal(true)
      setDraggedStock(null)
    }
  }

  const handlePlusClick = (positionType: string, slotIndex: number) => {
    setSelectedPosition({ positionType, slotIndex })
    setModalSearchTerm("")
    setShowStockSelectModal(true)
  }

  const handleStockSelect = (stock: Stock) => {
    if (selectedPosition) {
      setSelectedPosition({ ...selectedPosition, stock })
      setCustomRiskLevel(stock.riskLevel)
      setPurchasePrice(stock.currentPrice.toString())
      setShowStockSelectModal(false)
      setShowInvestmentModal(true)
    }
  }

  const handleAddPlayer = () => {
    if (selectedPosition && selectedPosition.stock && shares && purchasePrice && startDate) {
      const newPlayer: Player = {
        id: `${selectedPosition.positionType}-${selectedPosition.slotIndex}`,
        ticker: selectedPosition.stock.ticker,
        name: selectedPosition.stock.name,
        riskLevel: customRiskLevel,
        position:
          currentFormation.positions[selectedPosition.positionType as keyof typeof currentFormation.positions][
            selectedPosition.slotIndex
          ],
        positionType: selectedPosition.positionType as any,
        shares: Number.parseFloat(shares),
        purchasePrice: Number.parseFloat(purchasePrice),
        startDate: startDate,
        color: selectedPosition.stock.color,
        icon: selectedPosition.stock.icon,
        currentPrice: selectedPosition.stock.currentPrice,
        dividendYield: selectedPosition.stock.dividendYield,
        previousPrice: selectedPosition.stock.currentPrice,
        priceChange: 0,
        priceChangePercent: 0,
      }

      setPlayers((prev) => {
        const filtered = prev.filter((p) => p.id !== newPlayer.id)
        return [...filtered, newPlayer]
      })

      setShowInvestmentModal(false)
      setSelectedPosition(null)
      setShares("")
      setPurchasePrice("")
      setStartDate("")
      setSearchTerm("")
      setSearchResults([])
    }
  }

  const handleRemovePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  const handleRiskChange = (playerId: string, newRisk: "low" | "medium" | "high") => {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, riskLevel: newRisk } : p)))
  }

  const getPlayerAtPosition = (positionType: string, slotIndex: number) => {
    return players.find((p) => p.id === `${positionType}-${slotIndex}`)
  }

  const togglePositionGroup = (positionType: string) => {
    setExpandedPositionGroups((prev) => ({
      ...prev,
      [positionType]: !prev[positionType],
    }))
  }

  // 포지션별 투자 비중 계산
  const getPositionStats = () => {
    const totalValue = players.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)

    const defenders = players.filter((p) => p.positionType === "defender")
    const midfielders = players.filter((p) => p.positionType === "midfielder")
    const forwards = players.filter((p) => p.positionType === "forward")

    const defenderValue = defenders.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)
    const midfielderValue = midfielders.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)
    const forwardValue = forwards.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)

    return {
      defender: {
        value: defenderValue,
        percentage: totalValue > 0 ? (defenderValue / totalValue) * 100 : 0,
        count: defenders.length,
        players: defenders.sort((a, b) => b.shares * b.currentPrice - a.shares * a.currentPrice),
      },
      midfielder: {
        value: midfielderValue,
        percentage: totalValue > 0 ? (midfielderValue / totalValue) * 100 : 0,
        count: midfielders.length,
        players: midfielders.sort((a, b) => b.shares * b.currentPrice - a.shares * a.currentPrice),
      },
      forward: {
        value: forwardValue,
        percentage: totalValue > 0 ? (forwardValue / totalValue) * 100 : 0,
        count: forwards.length,
        players: forwards.sort((a, b) => b.shares * b.currentPrice - a.shares * a.currentPrice),
      },
      total: totalValue,
      pieData: [
        {
          name: "수비수",
          value: defenderValue,
          count: defenders.length,
          color: POSITION_COLORS.defender,
          percentage: totalValue > 0 ? ((defenderValue / totalValue) * 100).toFixed(1) : "0",
        },
        {
          name: "미드필더",
          value: midfielderValue,
          count: midfielders.length,
          color: POSITION_COLORS.midfielder,
          percentage: totalValue > 0 ? ((midfielderValue / totalValue) * 100).toFixed(1) : "0",
        },
        {
          name: "공격수",
          value: forwardValue,
          count: forwards.length,
          color: POSITION_COLORS.forward,
          percentage: totalValue > 0 ? ((forwardValue / totalValue) * 100).toFixed(1) : "0",
        },
      ].filter((item) => item.value > 0),
    }
  }

  // 포트폴리오 전체 수익률 계산
  const getPortfolioStats = () => {
    const totalInvested = players.reduce((sum, p) => sum + p.shares * p.purchasePrice, 0)
    const totalCurrent = players.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)
    const totalReturn = totalCurrent - totalInvested
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0
    const totalDividend = players.reduce((sum, p) => sum + (p.shares * p.currentPrice * p.dividendYield) / 100, 0)

    return {
      totalInvested,
      totalCurrent,
      totalReturn,
      returnPercentage,
      totalDividend,
    }
  }

  const formatCurrency = (amount: number) => {
    if (showKRW) {
      return `₩${(amount * usdToKrw).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatCurrencyWithTooltip = (amount: number) => {
    const usdAmount = `$${amount.toLocaleString()}`
    const krwAmount = `₩${(amount * usdToKrw).toLocaleString()}`

    if (showKRW) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help border-b border-dotted border-gray-400">{krwAmount}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{usdAmount}</p>
          </TooltipContent>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help border-b border-dotted border-gray-400">{usdAmount}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{krwAmount}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  }

  // 가격 변동 색상 반환
  const getPriceChangeColor = (priceChange?: number) => {
    if (!priceChange) return "text-gray-600"
    return priceChange > 0 ? "text-green-600" : priceChange < 0 ? "text-red-600" : "text-gray-600"
  }

  // 가격 변동 아이콘 반환
  const getPriceChangeIcon = (priceChange?: number) => {
    if (!priceChange) return null
    return priceChange > 0 ? <TrendingUp size={12} /> : priceChange < 0 ? <TrendingDown size={12} /> : null
  }

  // 데이터 기준 시점
  const getDataTimestamp = () => {
    return {
      date: lastUpdateTime.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
      time: lastUpdateTime.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }
  }

  const renderPositionSlot = (positionType: string, slotIndex: number) => {
    const position = currentFormation.positions[positionType as keyof typeof currentFormation.positions][slotIndex]
    const player = getPlayerAtPosition(positionType, slotIndex)
    const isDropZone = dropZone === positionType

    return (
      <div
        key={`${positionType}-${slotIndex}`}
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
          isDropZone ? "ring-2 ring-blue-400 ring-opacity-50" : ""
        }`}
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
        onDragOver={(e) => handleDragOver(e, positionType)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, positionType, slotIndex)}
      >
        {player ? (
          <div
            className={`bg-white rounded-xl shadow-md p-2 min-w-[60px] relative group transition-all duration-300 ${
              player.priceChange && player.priceChange > 0
                ? "ring-2 ring-green-300"
                : player.priceChange && player.priceChange < 0
                  ? "ring-2 ring-red-300"
                  : ""
            }`}
            onDoubleClick={() => handleEditPlayer(player)}
          >
            <button
              onClick={() => handleRemovePlayer(player.id)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X size={10} />
            </button>

            <div
              className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: player.color }}
            >
              <span className="text-sm">{player.icon}</span>
            </div>

            <div className="text-center text-xs font-semibold text-gray-800">{player.ticker}</div>

            {/* 실시간 가격 변동 표시 */}
            <div className="text-center text-xs mt-1">
              {player.priceChangePercent !== undefined && (
                <div className={`flex items-center justify-center ${getPriceChangeColor(player.priceChange)}`}>
                  {getPriceChangeIcon(player.priceChange)}
                  <span className="ml-0.5">
                    {player.priceChangePercent > 0 ? "+" : ""}
                    {player.priceChangePercent.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-1">
              <Select
                value={player.riskLevel}
                onValueChange={(value: "low" | "medium" | "high") => handleRiskChange(player.id, value)}
              >
                <SelectTrigger className="w-6 h-6 p-0 border-0 bg-transparent">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(player.riskLevel)}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>저위험</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span>중위험</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>고위험</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg whitespace-nowrap z-10">
              <div>{player.name}</div>
              <div>
                {player.shares}주 × {formatCurrency(player.currentPrice)}
              </div>
              <div>매입가: {formatCurrency(player.purchasePrice)}</div>
              <div>배당률: {player.dividendYield.toFixed(2)}%</div>
              <div>Since: {player.startDate}</div>
              {player.priceChange !== undefined && (
                <div className={getPriceChangeColor(player.priceChange)}>
                  오늘: {player.priceChange > 0 ? "+" : ""}
                  {formatCurrency(player.priceChange)}
                </div>
              )}
              <div className="text-xs text-blue-400 mt-1 border-t border-gray-600 pt-1">💡 더블클릭하여 수정</div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handlePlusClick(positionType, slotIndex)}
            className={`w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors ${
              isDropZone ? "border-blue-400 bg-blue-50" : ""
            }`}
          >
            <Plus size={16} className="text-gray-400" />
          </button>
        )}
      </div>
    )
  }

  const getTotalPlayers = () => {
    return Object.values(currentFormation.positions).reduce((total, positions) => total + positions.length, 0)
  }

  const positionStats = getPositionStats()
  const portfolioStats = getPortfolioStats()

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <Header onLoginClick={handleLoginClick} />

        {/* 메인 컨텐츠 */}
        <div className="py-6">
          <div className="w-full max-w-6xl mx-auto p-4">
            {/* 게스트 모드 안내 (로그인하지 않은 경우만 표시) */}
            {!user && <GuestNotice onLoginClick={handleLoginClick} />}

            {/* 실시간 데이터 상태 표시 */}
            <div className="mb-4 flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {connectionStatus === "connected" ? (
                    <Wifi size={16} className="text-green-600" />
                  ) : connectionStatus === "connecting" ? (
                    <RefreshCw size={16} className="text-blue-600 animate-spin" />
                  ) : (
                    <WifiOff size={16} className="text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {connectionStatus === "connected"
                      ? "실시간 연결됨"
                      : connectionStatus === "connecting"
                        ? "업데이트 중..."
                        : "연결 끊김"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">마지막 업데이트: {getDataTimestamp().time}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw size={16} className="animate-spin mr-1" />
                  ) : (
                    <RefreshCw size={16} className="mr-1" />
                  )}
                  새로고침
                </Button>
              </div>
            </div>

            {/* 포메이션 선택 및 추천 포트폴리오 */}
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-2 mr-4">
                <Users size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">포메이션:</span>
              </div>
              {formations.map((formation) => (
                <button
                  key={formation.code}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentFormation.code === formation.code
                      ? "bg-blue-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleFormationChange(formation.code)}
                >
                  {formation.name}
                </button>
              ))}

              {/* 추천 포트폴리오 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecommendedPortfolioModal(true)}
                className="ml-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
              >
                <Sparkles size={16} className="mr-1" />
                추천 포트폴리오
              </Button>

              {/* 포트폴리오 관리 버튼들 추가 */}
              <PortfolioManager
                currentFormation={currentFormation.code}
                currentPlayers={players}
                onLoadPortfolio={handleLoadPortfolio}
                onLoginClick={handleLoginClick}
              />

              {/* 통화 토글 */}
              <div className="ml-auto flex items-center gap-2">
                <Button variant={!showKRW ? "default" : "outline"} size="sm" onClick={() => setShowKRW(false)}>
                  USD
                </Button>
                <Button variant={showKRW ? "default" : "outline"} size="sm" onClick={() => setShowKRW(true)}>
                  KRW
                </Button>
              </div>
            </div>

            {/* 검색 섹션 */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="종목 티커나 이름을 검색하세요 (예: AAPL, Tesla, SCHD, Coupang)"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.ticker}
                      draggable
                      onDragStart={() => handleDragStart(stock)}
                      className="p-3 hover:bg-gray-50 cursor-move border-b last:border-b-0 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: stock.color }}
                        >
                          <span>{stock.icon}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{stock.ticker}</div>
                          <div className="text-xs text-gray-600">{stock.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{formatCurrency(stock.currentPrice)}</span>
                            {stock.priceChangePercent !== undefined && (
                              <span className={`flex items-center gap-1 ${getPriceChangeColor(stock.priceChange)}`}>
                                {getPriceChangeIcon(stock.priceChange)}
                                {stock.priceChangePercent > 0 ? "+" : ""}
                                {stock.priceChangePercent.toFixed(1)}%
                              </span>
                            )}
                            <span>| 배당 {stock.dividendYield.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getRiskBadgeColor(stock.riskLevel)}>{stock.riskLevel}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 위험도 기준 설명 */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">위험도 기준 (변경 가능)</span>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <div>
                  <span className="font-medium">저위험:</span> 대형주, 배당주, 안정적 ETF (변동성 낮음)
                </div>
                <div>
                  <span className="font-medium">중위험:</span> 성장주, 일반 ETF, 테크주 (적당한 변동성)
                </div>
                <div>
                  <span className="font-medium">고위험:</span> 신흥기업, 암호화폐, 투기성 자산 (높은 변동성)
                </div>
              </div>
            </div>

            {/* 축구장 (단순화된 디자인) */}
            <div className="relative w-full aspect-[3/4] bg-green-100 rounded-2xl overflow-hidden shadow-lg border-2 border-green-200">
              {/* 기존 필드 마킹 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-green-400 rounded-full opacity-60" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 opacity-60" />

              {/* 포지션별 슬롯 렌더링 */}
              {Object.entries(currentFormation.positions).map(([positionType, positions]) =>
                positions.map((_, slotIndex) => renderPositionSlot(positionType, slotIndex)),
              )}

              {/* 포지션 라벨 */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-sm font-medium text-gray-700">{currentFormation.name} Formation</div>
                <div className="text-xs text-gray-500">
                  {players.length}/{getTotalPlayers()} players
                </div>
              </div>

              {/* 포지션별 비중 요약 */}
              {positionStats.total > 0 && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                  <div className="font-medium text-gray-700 mb-1">포지션별 비중</div>
                  {positionStats.defender.count > 0 && (
                    <div className="text-green-600 flex items-center gap-1">
                      <Shield size={12} />
                      수비수: {positionStats.defender.percentage.toFixed(1)}%
                    </div>
                  )}
                  {positionStats.midfielder.count > 0 && (
                    <div className="text-yellow-600 flex items-center gap-1">
                      <Zap size={12} />
                      미드필더: {positionStats.midfielder.percentage.toFixed(1)}%
                    </div>
                  )}
                  {positionStats.forward.count > 0 && (
                    <div className="text-red-600 flex items-center gap-1">
                      <Target size={12} />
                      공격수: {positionStats.forward.percentage.toFixed(1)}%
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 로그인 모달 */}
            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
              <DialogContent className="max-w-md p-0 overflow-hidden">
                <LoginForm />
              </DialogContent>
            </Dialog>

            {/* 추천 포트폴리오 모달 */}
            <Dialog open={showRecommendedPortfolioModal} onOpenChange={setShowRecommendedPortfolioModal}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-600" />
                    추천 포트폴리오
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {recommendedPortfolios.map((portfolio, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{portfolio.icon}</div>
                          <div>
                            <h3 className="font-semibold text-lg">{portfolio.name}</h3>
                            <p className="text-sm text-gray-600">{portfolio.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              포메이션: {formations.find((f) => f.code === portfolio.formation)?.name} | 종목 수:{" "}
                              {portfolio.players.length}개
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => applyRecommendedPortfolio(portfolio)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Star size={16} className="mr-1" />
                          적용하기
                        </Button>
                      </div>

                      {/* 포트폴리오 미리보기 */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-green-50 p-2 rounded">
                          <div className="font-medium text-green-700">수비수</div>
                          <div className="text-green-600">
                            {portfolio.players
                              .filter((p) => p.positionType === "defender")
                              .map((p) => p.ticker)
                              .join(", ")}
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="font-medium text-yellow-700">미드필더</div>
                          <div className="text-yellow-600">
                            {portfolio.players
                              .filter((p) => p.positionType === "midfielder")
                              .map((p) => p.ticker)
                              .join(", ")}
                          </div>
                        </div>
                        <div className="bg-red-50 p-2 rounded">
                          <div className="font-medium text-red-700">공격수</div>
                          <div className="text-red-600">
                            {portfolio.players
                              .filter((p) => p.positionType === "forward")
                              .map((p) => p.ticker)
                              .join(", ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* 종목 선택 모달 */}
            <Dialog open={showStockSelectModal} onOpenChange={setShowStockSelectModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>종목 선택</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      type="text"
                      placeholder="종목 검색..."
                      value={modalSearchTerm}
                      onChange={(e) => setModalSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {getFilteredStocks().map((stock) => (
                        <button
                          key={stock.ticker}
                          onClick={() => handleStockSelect(stock)}
                          className="w-full p-3 hover:bg-gray-50 border rounded-lg flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: stock.color }}
                            >
                              <span>{stock.icon}</span>
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-sm">{stock.ticker}</div>
                              <div className="text-xs text-gray-600">{stock.name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span>{formatCurrency(stock.currentPrice)}</span>
                                {stock.priceChangePercent !== undefined && (
                                  <span className={`flex items-center gap-1 ${getPriceChangeColor(stock.priceChange)}`}>
                                    {getPriceChangeIcon(stock.priceChange)}
                                    {stock.priceChangePercent > 0 ? "+" : ""}
                                    {stock.priceChangePercent.toFixed(1)}%
                                  </span>
                                )}
                                <span>| 배당 {stock.dividendYield.toFixed(2)}%</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getRiskBadgeColor(stock.riskLevel)}>{stock.riskLevel}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 투자 정보 입력 모달 */}
            <Dialog open={showInvestmentModal} onOpenChange={setShowInvestmentModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedPosition?.stock && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: selectedPosition.stock.color }}
                      >
                        {selectedPosition.stock.icon}
                      </div>
                    )}
                    {selectedPosition?.stock?.ticker} 투자 정보 입력
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedPosition?.stock && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>현재가: {formatCurrency(selectedPosition.stock.currentPrice)}</span>
                        {selectedPosition.stock.priceChangePercent !== undefined && (
                          <span
                            className={`flex items-center gap-1 ${getPriceChangeColor(selectedPosition.stock.priceChange)}`}
                          >
                            {getPriceChangeIcon(selectedPosition.stock.priceChange)}
                            {selectedPosition.stock.priceChangePercent > 0 ? "+" : ""}
                            {selectedPosition.stock.priceChangePercent.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        배당률: {selectedPosition.stock.dividendYield.toFixed(2)}%
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="risk">위험도 설정</Label>
                    <Select
                      value={customRiskLevel}
                      onValueChange={(value: "low" | "medium" | "high") => setCustomRiskLevel(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span>저위험</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <span>중위험</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span>고위험</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shares">보유 주식 수</Label>
                    <Input
                      id="shares"
                      type="number"
                      placeholder="10"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchasePrice">매입가 ({showKRW ? "KRW" : "USD"})</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      placeholder="100.00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">투자 시작일</Label>
                    <Input id="date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  {shares && purchasePrice && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-800">
                        총 투자금액: {formatCurrency(Number.parseFloat(shares) * Number.parseFloat(purchasePrice))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleAddPlayer} className="flex-1">
                      포지션에 배치
                    </Button>
                    <Button variant="outline" onClick={() => setShowInvestmentModal(false)} className="flex-1">
                      취소
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 플레이어 편집 모달 */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {editingPlayer && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: editingPlayer.color }}
                      >
                        {editingPlayer.icon}
                      </div>
                    )}
                    {editingPlayer?.ticker} 투자 정보 수정
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {editingPlayer && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>현재가: {formatCurrency(editingPlayer.currentPrice)}</span>
                        {editingPlayer.priceChangePercent !== undefined && (
                          <span className={`flex items-center gap-1 ${getPriceChangeColor(editingPlayer.priceChange)}`}>
                            {getPriceChangeIcon(editingPlayer.priceChange)}
                            {editingPlayer.priceChangePercent > 0 ? "+" : ""}
                            {editingPlayer.priceChangePercent.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">배당률: {editingPlayer.dividendYield.toFixed(2)}%</div>
                      <div className="text-xs text-gray-500 mt-1">
                        현재 보유: {editingPlayer.shares}주 × {formatCurrency(editingPlayer.purchasePrice)} ={" "}
                        {formatCurrency(editingPlayer.shares * editingPlayer.purchasePrice)}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="edit-risk">위험도 설정</Label>
                    <Select
                      value={customRiskLevel}
                      onValueChange={(value: "low" | "medium" | "high") => setCustomRiskLevel(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span>저위험</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <span>중위험</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span>고위험</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-shares">보유 주식 수</Label>
                    <Input
                      id="edit-shares"
                      type="number"
                      placeholder="10"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-purchasePrice">평균 매입가 ({showKRW ? "KRW" : "USD"})</Label>
                    <Input
                      id="edit-purchasePrice"
                      type="number"
                      placeholder="100.00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-date">투자 시작일</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  {shares && purchasePrice && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-800">
                        총 투자금액: {formatCurrency(Number.parseFloat(shares) * Number.parseFloat(purchasePrice))}
                      </div>
                      {editingPlayer && (
                        <div className="text-xs text-gray-600 mt-1">
                          기존 투자금액: {formatCurrency(editingPlayer.shares * editingPlayer.purchasePrice)}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleUpdatePlayer} className="flex-1">
                      수정 완료
                    </Button>
                    <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                      취소
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 포트폴리오 요약 */}
            {players.length > 0 && (
              <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">포트폴리오 요약</h3>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-600">환율: 1 USD = {usdToKrw.toLocaleString()} KRW</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      기준시점: {getDataTimestamp().date} {getDataTimestamp().time}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 기본 통계 */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">투자 현황</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-gray-600">총 투자금액</div>
                        <div className="font-semibold text-lg">
                          {formatCurrencyWithTooltip(portfolioStats.totalInvested)}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-gray-600">현재 가치</div>
                        <div className="font-semibold text-lg">
                          {formatCurrencyWithTooltip(portfolioStats.totalCurrent)}
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${portfolioStats.totalReturn >= 0 ? "bg-green-50" : "bg-red-50"}`}
                      >
                        <div className="text-gray-600">총 수익/손실</div>
                        <div
                          className={`font-semibold text-lg flex items-center ${portfolioStats.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {portfolioStats.totalReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          <span className="ml-1">{formatCurrencyWithTooltip(portfolioStats.totalReturn)}</span>
                        </div>
                        <div
                          className={`text-sm ${portfolioStats.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ({portfolioStats.returnPercentage.toFixed(2)}%)
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-gray-600">연간 배당 예상</div>
                        <div className="font-semibold text-lg text-blue-600">
                          {formatCurrencyWithTooltip(portfolioStats.totalDividend)}
                        </div>
                      </div>
                    </div>

                    <h4 className="font-medium mb-3 text-gray-700">포지션별 상세 현황</h4>
                    <div className="space-y-3">
                      {/* 수비수 그룹 */}
                      {positionStats.defender.count > 0 && (
                        <Collapsible
                          open={expandedPositionGroups.defender}
                          onOpenChange={() => togglePositionGroup("defender")}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                              <div className="flex items-center gap-2">
                                <Shield size={16} className="text-green-600" />
                                <span className="font-medium">수비수 ({positionStats.defender.count}개)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {formatCurrencyWithTooltip(positionStats.defender.value)}
                                </span>
                                {expandedPositionGroups.defender ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 space-y-2 pl-4">
                              {positionStats.defender.players.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex items-center justify-between p-2 bg-white border rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                      style={{ backgroundColor: player.color }}
                                    >
                                      {player.icon}
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{player.ticker}</div>
                                      <div className="text-xs text-gray-500">
                                        {player.shares}주 × {formatCurrencyWithTooltip(player.currentPrice)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        배당: {player.dividendYield.toFixed(2)}%
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-sm">
                                      {formatCurrencyWithTooltip(player.shares * player.currentPrice)}
                                    </div>
                                    <div
                                      className={`text-xs ${(((player.currentPrice - player.purchasePrice) / player.purchasePrice) * 100) >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      {(
                                        ((player.currentPrice - player.purchasePrice) / player.purchasePrice) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </div>
                                    {player.priceChangePercent !== undefined && (
                                      <div
                                        className={`text-xs flex items-center gap-1 ${getPriceChangeColor(player.priceChange)}`}
                                      >
                                        {getPriceChangeIcon(player.priceChange)}
                                        오늘: {player.priceChangePercent > 0 ? "+" : ""}
                                        {player.priceChangePercent.toFixed(1)}%
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* 미드필더 그룹 */}
                      {positionStats.midfielder.count > 0 && (
                        <Collapsible
                          open={expandedPositionGroups.midfielder}
                          onOpenChange={() => togglePositionGroup("midfielder")}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                              <div className="flex items-center gap-2">
                                <Zap size={16} className="text-yellow-600" />
                                <span className="font-medium">미드필더 ({positionStats.midfielder.count}개)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {formatCurrencyWithTooltip(positionStats.midfielder.value)}
                                </span>
                                {expandedPositionGroups.midfielder ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 space-y-2 pl-4">
                              {positionStats.midfielder.players.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex items-center justify-between p-2 bg-white border rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                      style={{ backgroundColor: player.color }}
                                    >
                                      {player.icon}
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{player.ticker}</div>
                                      <div className="text-xs text-gray-500">
                                        {player.shares}주 × {formatCurrencyWithTooltip(player.currentPrice)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        배당: {player.dividendYield.toFixed(2)}%
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-sm">
                                      {formatCurrencyWithTooltip(player.shares * player.currentPrice)}
                                    </div>
                                    <div
                                      className={`text-xs ${(((player.currentPrice - player.purchasePrice) / player.purchasePrice) * 100) >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      {(
                                        ((player.currentPrice - player.purchasePrice) / player.purchasePrice) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </div>
                                    {player.priceChangePercent !== undefined && (
                                      <div
                                        className={`text-xs flex items-center gap-1 ${getPriceChangeColor(player.priceChange)}`}
                                      >
                                        {getPriceChangeIcon(player.priceChange)}
                                        오늘: {player.priceChangePercent > 0 ? "+" : ""}
                                        {player.priceChangePercent.toFixed(1)}%
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* 공격수 그룹 */}
                      {positionStats.forward.count > 0 && (
                        <Collapsible
                          open={expandedPositionGroups.forward}
                          onOpenChange={() => togglePositionGroup("forward")}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                              <div className="flex items-center gap-2">
                                <Target size={16} className="text-red-600" />
                                <span className="font-medium">공격수 ({positionStats.forward.count}개)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {formatCurrencyWithTooltip(positionStats.forward.value)}
                                </span>
                                {expandedPositionGroups.forward ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 space-y-2 pl-4">
                              {positionStats.forward.players.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex items-center justify-between p-2 bg-white border rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                      style={{ backgroundColor: player.color }}
                                    >
                                      {player.icon}
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{player.ticker}</div>
                                      <div className="text-xs text-gray-500">
                                        {player.shares}주 × {formatCurrencyWithTooltip(player.currentPrice)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        배당: {player.dividendYield.toFixed(2)}%
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-sm">
                                      {formatCurrencyWithTooltip(player.shares * player.currentPrice)}
                                    </div>
                                    <div
                                      className={`text-xs ${(((player.currentPrice - player.purchasePrice) / player.purchasePrice) * 100) >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      {(
                                        ((player.currentPrice - player.purchasePrice) / player.purchasePrice) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </div>
                                    {player.priceChangePercent !== undefined && (
                                      <div
                                        className={`text-xs flex items-center gap-1 ${getPriceChangeColor(player.priceChange)}`}
                                      >
                                        {getPriceChangeIcon(player.priceChange)}
                                        오늘: {player.priceChangePercent > 0 ? "+" : ""}
                                        {player.priceChangePercent.toFixed(1)}%
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>

                  {/* 파이차트 */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">포지션별 비중</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={positionStats.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {positionStats.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Legend formatter={(value, entry: any) => `${value} (${entry.payload.percentage}%)`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}
