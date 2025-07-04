"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, TrendingUp } from "lucide-react"
import type { Player } from "../football-manager"

interface DividendChartProps {
  players: Player[]
  showKRW: boolean
  usdToKrw: number
}

interface MonthlyDividend {
  month: string
  monthNumber: number
  totalDividend: number
  details: {
    ticker: string
    name: string
    dividend: number
    color: string
    icon: string
    dividendYield: number
  }[]
}

// 배당 지급 월 매핑 (실제 배당 지급 월에 맞게 조정)
const getDividendPaymentMonths = (ticker: string): number[] => {
  const dividendSchedules: Record<string, number[]> = {
    // 분기별 배당 (3, 6, 9, 12월)
    AAPL: [3, 6, 9, 12],
    MSFT: [3, 6, 9, 12],
    GOOGL: [3, 6, 9, 12],
    JNJ: [3, 6, 9, 12],
    PG: [3, 6, 9, 12],
    KO: [3, 6, 9, 12],
    V: [3, 6, 9, 12],
    JPM: [3, 6, 9, 12],
    WMT: [3, 6, 9, 12],
    SCHD: [3, 6, 9, 12],
    SPY: [3, 6, 9, 12],
    QQQ: [3, 6, 9, 12],
    
    // 월별 배당 (매월)
    O: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    
    // 반기별 배당 (6, 12월)
    BRK: [6, 12],
    
    // 연 1회 배당 (12월)
    AMZN: [12],
    META: [12],
    NFLX: [12],
    TSLA: [12],
    NVDA: [12],
    BTC: [12],
    ETH: [12],
  }

  return dividendSchedules[ticker] || [3, 6, 9, 12] // 기본값: 분기별
}

const CustomTooltip = ({ active, payload, label, showKRW, usdToKrw }: any) => {
  if (active && payload && payload.length) {
    const data: MonthlyDividend = payload[0].payload
    const formatCurrency = (amount: number) => {
      if (showKRW) {
        return `₩${(amount * usdToKrw).toLocaleString()}`
      }
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return (
      <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs pointer-events-none transform-gpu">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={14} className="text-blue-600" />
          <p className="font-bold text-base text-gray-900">{`${label} 예상 배당금`}</p>
        </div>
        
        <div className="mb-2 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-blue-600" />
            <span className="font-semibold text-blue-900 text-sm">
              총 배당금: {formatCurrency(data.totalDividend)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700 mb-1">종목별 배당금:</p>
          {data.details.map((detail) => (
            <div key={detail.ticker} className="flex items-center justify-between p-1 bg-gray-50 rounded">
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: detail.color }}
                >
                  {detail.icon}
                </div>
                <div>
                  <div className="font-medium text-xs">{detail.ticker}</div>
                  <div className="text-xs text-gray-500 truncate max-w-20">{detail.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-xs">{formatCurrency(detail.dividend)}</div>
                <div className="text-xs text-gray-500">{detail.dividendYield.toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default function DividendChart({ players, showKRW, usdToKrw }: DividendChartProps) {
  const calculateMonthlyDividends = (): MonthlyDividend[] => {
    const monthlyData: MonthlyDividend[] = Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}월`,
      monthNumber: i + 1,
      totalDividend: 0,
      details: [],
    }))

    players.forEach((player) => {
      const annualDividendPerShare = (player.purchasePrice * player.dividendYield) / 100
      const quarterlyDividendPerShare = annualDividendPerShare / 4
      const totalQuarterlyDividend = player.shares * quarterlyDividendPerShare

      const paymentMonths = getDividendPaymentMonths(player.ticker)

      paymentMonths.forEach((month) => {
        if (month >= 1 && month <= 12) {
          monthlyData[month - 1].totalDividend += totalQuarterlyDividend
          monthlyData[month - 1].details.push({
            ticker: player.ticker,
            name: player.name,
            dividend: totalQuarterlyDividend,
            color: player.color,
            icon: player.icon,
            dividendYield: player.dividendYield,
          })
        }
      })
    })

    return monthlyData
  }

  const data = calculateMonthlyDividends()
  const formatCurrency = (amount: number) => {
    if (showKRW) {
      return `₩${(amount * usdToKrw).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  const totalAnnualDividend = data.reduce((sum, month) => sum + month.totalDividend, 0)
  const monthsWithDividend = data.filter(month => month.totalDividend > 0).length

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp size={20} className="text-green-600" />
          월별 예상 배당금
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <DollarSign size={14} />
            <span>연간 총 배당: {formatCurrency(totalAnnualDividend)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>배당 지급 월: {monthsWithDividend}개월</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatCurrency} 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={<CustomTooltip showKRW={showKRW} usdToKrw={usdToKrw} />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar 
                dataKey="totalDividend" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="월별 배당금"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 배당 정보 요약 */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">최고 배당월</span>
            </div>
            {(() => {
              const maxMonth = data.reduce((max, month) => 
                month.totalDividend > max.totalDividend ? month : max
              )
              return (
                <div className="text-lg font-semibold text-green-900">
                  {maxMonth.month} ({formatCurrency(maxMonth.totalDividend)})
                </div>
              )
            })()}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">평균 월 배당</span>
            </div>
            <div className="text-lg font-semibold text-blue-900">
              {formatCurrency(totalAnnualDividend / 12)}
            </div>
          </div>
        </div>

        {/* 배당금 기여 종목 리스트 */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={16} className="text-green-600" />
            <h4 className="font-semibold text-gray-700">배당금 기여 종목 (비중순)</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            {(() => {
              // 연간 배당금 계산
              const annualDividendByStock = players.map(player => {
                const annualDividendPerShare = (player.purchasePrice * player.dividendYield) / 100
                const totalAnnualDividend = player.shares * annualDividendPerShare
                return {
                  ticker: player.ticker,
                  name: player.name,
                  annualDividend: totalAnnualDividend,
                  dividendYield: player.dividendYield,
                  color: player.color,
                  icon: player.icon
                }
              }).sort((a, b) => b.annualDividend - a.annualDividend)

              // 비중 계산
              const totalDividend = annualDividendByStock.reduce((sum, stock) => sum + stock.annualDividend, 0)
              const stocksWithWeight = annualDividendByStock.map(stock => ({
                ...stock,
                weight: totalDividend > 0 ? (stock.annualDividend / totalDividend) * 100 : 0
              }))

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stocksWithWeight.map((stock, index) => (
                    <div key={stock.ticker} className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: stock.color }}
                        >
                          {stock.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{stock.ticker}</div>
                        <div className="text-xs text-gray-500 truncate">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatCurrency(stock.annualDividend)}</div>
                        <div className="text-xs text-gray-500">{stock.weight.toFixed(1)}%</div>
                        <div className="text-xs text-green-600">{stock.dividendYield.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
