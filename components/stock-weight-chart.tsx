"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { Player } from "../football-manager"

interface StockWeightChartProps {
  players: Player[]
  showKRW: boolean
  usdToKrw: number
}

interface StockWeight {
  ticker: string
  name: string
  weight: number
  value: number
  color: string
  icon: string
}

const CustomTooltip = ({ active, payload, showKRW, usdToKrw }: any) => {
  if (active && payload && payload.length) {
    const data: StockWeight = payload[0].payload
    const formatCurrency = (amount: number) => {
      if (showKRW) {
        return `₩${(amount * usdToKrw).toLocaleString()}`
      }
      return `$${amount.toLocaleString()}`
    }

    return (
      <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
            style={{ backgroundColor: data.color }}
          >
            {data.icon}
          </div>
          <div>
            <p className="font-semibold text-sm">{data.ticker}</p>
            <p className="text-xs text-gray-600">{data.name}</p>
          </div>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">비중:</span>
            <span className="font-semibold">{data.weight.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">가치:</span>
            <span className="font-medium">{formatCurrency(data.value)}</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function StockWeightChart({ players, showKRW, usdToKrw }: StockWeightChartProps) {
  const calculateStockWeights = (): StockWeight[] => {
    const totalValue = players.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)
    
    return players
      .map(player => ({
        ticker: player.ticker,
        name: player.name,
        weight: totalValue > 0 ? ((player.shares * player.currentPrice) / totalValue) * 100 : 0,
        value: player.shares * player.currentPrice,
        color: player.color,
        icon: player.icon,
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6) // 상위 6개 종목만 표시
  }

  const stockWeights = calculateStockWeights()

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={stockWeights}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="weight"
          >
            {stockWeights.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip showKRW={showKRW} usdToKrw={usdToKrw} />} />
          <Legend 
            formatter={(value, entry: any) => `${entry.payload.ticker} (${entry.payload.weight.toFixed(1)}%)`}
            wrapperStyle={{ fontSize: '10px' }}
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 