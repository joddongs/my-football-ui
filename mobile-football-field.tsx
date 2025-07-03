"use client"

import { useState } from "react"

interface Player {
  id: string
  ticker: string
  riskLevel: "low" | "medium" | "high"
  position: { x: number; y: number }
  investedAmount: number
  startDate: string
  weight: number
}

const defaultPlayers: Player[] = [
  { id: "gk", ticker: "BOND", riskLevel: "low", position: { x: 50, y: 85 }, investedAmount: 10000, startDate: "2024-01-15", weight: 10 },
  { id: "def1", ticker: "AAPL", riskLevel: "low", position: { x: 15, y: 70 }, investedAmount: 7000, startDate: "2023-06-01", weight: 7 },
  { id: "def2", ticker: "MSFT", riskLevel: "low", position: { x: 38, y: 65 }, investedAmount: 8000, startDate: "2023-05-10", weight: 8 },
  { id: "def3", ticker: "JNJ", riskLevel: "low", position: { x: 62, y: 65 }, investedAmount: 6000, startDate: "2023-07-20", weight: 6 },
  { id: "def4", ticker: "PG", riskLevel: "medium", position: { x: 85, y: 70 }, investedAmount: 5000, startDate: "2024-03-12", weight: 5 },
  { id: "mid1", ticker: "GOOGL", riskLevel: "medium", position: { x: 25, y: 45 }, investedAmount: 9000, startDate: "2024-02-05", weight: 9 },
  { id: "mid2", ticker: "SPY", riskLevel: "medium", position: { x: 50, y: 40 }, investedAmount: 11000, startDate: "2023-10-22", weight: 11 },
  { id: "mid3", ticker: "NVDA", riskLevel: "high", position: { x: 75, y: 45 }, investedAmount: 12000, startDate: "2024-05-30", weight: 12 },
  { id: "fwd1", ticker: "TSLA", riskLevel: "high", position: { x: 30, y: 20 }, investedAmount: 9500, startDate: "2023-09-10", weight: 9.5 },
  { id: "fwd2", ticker: "BTC", riskLevel: "high", position: { x: 50, y: 15 }, investedAmount: 10000, startDate: "2022-12-01", weight: 10 },
  { id: "fwd3", ticker: "ETH", riskLevel: "high", position: { x: 70, y: 20 }, investedAmount: 8500, startDate: "2023-11-11", weight: 8.5 },
]

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "low": return "bg-green-500"
    case "medium": return "bg-yellow-500"
    case "high": return "bg-red-500"
    default: return "bg-gray-500"
  }
}

export default function MobileFootballField() {
  const [players, setPlayers] = useState<Player[]>(defaultPlayers)

  const totalWeight = players.reduce((acc, p) => acc + p.weight, 0)
  const defenseWeight = players.filter(p => p.id.startsWith("def")).reduce((acc, p) => acc + p.weight, 0)
  const midfieldWeight = players.filter(p => p.id.startsWith("mid")).reduce((acc, p) => acc + p.weight, 0)
  const forwardWeight = players.filter(p => p.id.startsWith("fwd")).reduce((acc, p) => acc + p.weight, 0)

  const handleTickerChange = (id: string, newTicker: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ticker: newTicker } : p))
  }

  return (
    <div className="flex flex-col md:flex-row md:gap-6 w-full max-w-4xl mx-auto p-4">
      <div className="relative w-full aspect-[3/4] bg-green-100 rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-green-300 rounded-full opacity-40" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-green-300 opacity-40" />
        {players.map((player) => (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${player.position.x}%`, top: `${player.position.y}%` }}>
            <div className="bg-white rounded-xl shadow-md p-2 min-w-[60px] hover:shadow-lg transition relative">
              <div className="w-8 h-8 mx-auto mb-1 bg-gray-200 rounded-full overflow-hidden">
                <img src={`/placeholder.svg?text=${player.ticker}`} alt={`${player.ticker} logo`} className="w-full h-full object-cover" />
              </div>
              <div className="text-center text-xs font-semibold text-gray-800">
                <input
                  type="text"
                  value={player.ticker}
                  onChange={(e) => handleTickerChange(player.id, e.target.value)}
                  className="text-center w-full text-xs font-semibold border border-gray-300 rounded p-0.5"
                />
              </div>
              <div className="flex justify-center mt-1">
                <div className={`w-2 h-2 rounded-full ${getRiskColor(player.riskLevel)}`} title={`Risk: ${player.riskLevel}`} />
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-white text-xs text-gray-700 p-1 rounded shadow-lg">
                <div>Amount: ${player.investedAmount.toLocaleString()}</div>
                <div>Since: {player.startDate}</div>
                <div>Weight: {player.weight}%</div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="text-xs font-medium text-gray-700">Custom Formation</div>
        </div>
      </div>
      <div className="mt-4 md:mt-0 md:w-64">
        <h2 className="text-sm font-bold text-gray-800 mb-2">Position Breakdown</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>Defenders: {defenseWeight.toFixed(1)}%</li>
          <li>Midfielders: {midfieldWeight.toFixed(1)}%</li>
          <li>Forwards: {forwardWeight.toFixed(1)}%</li>
        </ul>
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-xs">Low Risk</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div><span className="text-xs">Medium Risk</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span className="text-xs">High Risk</span></div>
        </div>
      </div>
    </div>
  )
}
