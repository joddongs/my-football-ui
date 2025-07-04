"use client"

import { useState } from "react"
import { Building2 } from "lucide-react"
import type { Player } from "../football-manager"

interface SectorWeightChartProps {
  players: Player[]
  showKRW: boolean
  usdToKrw: number
}

interface SectorWeight {
  sector: string
  weight: number
  value: number
  color: string
}

// 섹터별 색상 정의
const SECTOR_COLORS: Record<string, string> = {
  "Technology": "#3B82F6",
  "Healthcare": "#10B981",
  "Financial": "#F59E0B",
  "Consumer Discretionary": "#EF4444",
  "Consumer Staples": "#8B5CF6",
  "Industrial": "#06B6D4",
  "Energy": "#F97316",
  "Real Estate": "#84CC16",
  "Communication Services": "#EC4899",
  "Materials": "#6B7280",
  "Utilities": "#14B8A6",
  "Cryptocurrency": "#F7931A",
  "ETF": "#6366F1",
}

export default function SectorWeightChart({ players, showKRW, usdToKrw }: SectorWeightChartProps) {
  const [hoveredSector, setHoveredSector] = useState<SectorWeight | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const calculateSectorWeights = (): SectorWeight[] => {
    const totalValue = players.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)
    const sectorMap = new Map<string, { value: number; color: string }>()

    players.forEach(player => {
      // 종목별 섹터 매핑
      const sectorMapData: Record<string, string> = {
        // Technology
        AAPL: "Technology", MSFT: "Technology", GOOGL: "Technology", 
        NVDA: "Technology", AMD: "Technology", INTC: "Technology",
        CRM: "Technology", ORCL: "Technology", ADBE: "Technology",
        NET: "Technology", DDOG: "Technology", MDB: "Technology",
        TEAM: "Technology", NOW: "Technology", WDAY: "Technology",
        OKTA: "Technology", CRWD: "Technology", ZS: "Technology",
        PLTR: "Technology", SNOW: "Technology", ROKU: "Technology",
        SQ: "Technology", PYPL: "Technology", TWLO: "Technology",
        DOCU: "Technology", SHOP: "Technology", ZM: "Technology",
        SNAP: "Technology", SPOT: "Technology", TWTR: "Technology",
        
        // Healthcare
        JNJ: "Healthcare", VEEV: "Healthcare", ZEN: "Healthcare",
        
        // Financial
        JPM: "Financial", V: "Financial", 
        
        // Consumer Discretionary
        AMZN: "Consumer Discretionary", TSLA: "Consumer Discretionary",
        DIS: "Consumer Discretionary", BA: "Consumer Discretionary",
        F: "Consumer Discretionary", GM: "Consumer Discretionary",
        UBER: "Consumer Discretionary", ABNB: "Consumer Discretionary",
        
        // Consumer Staples
        PG: "Consumer Staples", KO: "Consumer Staples", WMT: "Consumer Staples",
        
        // Industrial
        GE: "Industrial",
        
        // Communication Services
        META: "Communication Services", NFLX: "Communication Services",
        T: "Communication Services", VZ: "Communication Services",
        
        // Energy
        XOM: "Energy", CVX: "Energy",
        
        // ETF
        SPY: "ETF", QQQ: "ETF", SCHD: "ETF",
        
        // Cryptocurrency
        BTC: "Cryptocurrency", ETH: "Cryptocurrency", COIN: "Cryptocurrency",
        
        // E-commerce
        CPNG: "Consumer Discretionary",
      }

      const sector = sectorMapData[player.ticker] || "Technology"
      const playerValue = player.shares * player.currentPrice

      if (sectorMap.has(sector)) {
        const existing = sectorMap.get(sector)!
        existing.value += playerValue
      } else {
        sectorMap.set(sector, {
          value: playerValue,
          color: SECTOR_COLORS[sector] || "#6B7280",
        })
      }
    })

    // 비중 계산
    const sectors = Array.from(sectorMap.entries()).map(([sector, data]) => ({
      sector,
      weight: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      value: data.value,
      color: data.color,
    }))

    return sectors.sort((a, b) => b.weight - a.weight)
  }

  const sectorWeights = calculateSectorWeights()

  const formatCurrency = (amount: number) => {
    if (showKRW) {
      return `₩${(amount * usdToKrw).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  const handleMouseMove = (e: React.MouseEvent, sector: SectorWeight) => {
    setHoveredSector(sector)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredSector(null)
  }

  return (
    <div className="w-full relative">
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={16} className="text-indigo-600" />
        <h4 className="font-semibold text-gray-700">섹터별 비중</h4>
      </div>
      
      <div className="space-y-4">
        {/* 섹터별 비중 막대 */}
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          {sectorWeights.map((sector, index) => {
            const left = sectorWeights
              .slice(0, index)
              .reduce((sum, s) => sum + s.weight, 0)
            
            return (
              <div
                key={sector.sector}
                className="absolute top-0 h-full transition-all duration-200 hover:opacity-80 cursor-pointer"
                style={{
                  left: `${left}%`,
                  width: `${sector.weight}%`,
                  backgroundColor: sector.color,
                }}
                onMouseMove={(e) => handleMouseMove(e, sector)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}
        </div>

        {/* 커스텀 툴팁 */}
        {hoveredSector && (
          <div 
            className="fixed z-50 p-3 bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: hoveredSector.color }}
              />
              <div>
                <p className="font-semibold text-sm">{hoveredSector.sector}</p>
              </div>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">비중:</span>
                <span className="font-semibold">{hoveredSector.weight.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">가치:</span>
                <span className="font-medium">{formatCurrency(hoveredSector.value)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 섹터별 비중 정보 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {sectorWeights.slice(0, 8).map((sector) => (
            <div 
              key={sector.sector} 
              className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer" 
              onMouseMove={(e) => handleMouseMove(e, sector)}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: sector.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{sector.sector}</div>
                <div className="text-gray-500">{sector.weight.toFixed(1)}%</div>
              </div>
            </div>
          ))}
          {sectorWeights.length > 8 && (
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <div className="flex-1">
                <div className="font-medium">기타</div>
                <div className="text-gray-500">
                  {(100 - sectorWeights.slice(0, 8).reduce((sum, s) => sum + s.weight, 0)).toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 