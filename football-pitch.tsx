"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Player {
  id: string
  name: string
  allocation: number
  riskLevel: "Low" | "Medium" | "High"
  position: { x: number; y: number }
}

const players: Player[] = [
  // Goalkeeper
  { id: "gk", name: "Treasury Bonds", allocation: 15, riskLevel: "Low", position: { x: 50, y: 90 } },

  // Defenders (4-3-3 formation)
  { id: "def1", name: "Blue Chip Stocks", allocation: 12, riskLevel: "Low", position: { x: 20, y: 75 } },
  { id: "def2", name: "Corporate Bonds", allocation: 10, riskLevel: "Low", position: { x: 40, y: 70 } },
  { id: "def3", name: "Dividend ETFs", allocation: 8, riskLevel: "Medium", position: { x: 60, y: 70 } },
  { id: "def4", name: "Real Estate", allocation: 15, riskLevel: "Medium", position: { x: 80, y: 75 } },

  // Midfielders
  { id: "mid1", name: "Growth Stocks", allocation: 12, riskLevel: "Medium", position: { x: 25, y: 50 } },
  { id: "mid2", name: "Index Funds", allocation: 18, riskLevel: "Medium", position: { x: 50, y: 45 } },
  { id: "mid3", name: "Tech Stocks", allocation: 8, riskLevel: "High", position: { x: 75, y: 50 } },

  // Forwards
  { id: "fwd1", name: "Cryptocurrency", allocation: 5, riskLevel: "High", position: { x: 30, y: 25 } },
  { id: "fwd2", name: "Emerging Markets", allocation: 10, riskLevel: "High", position: { x: 50, y: 20 } },
  { id: "fwd3", name: "Commodities", allocation: 7, riskLevel: "High", position: { x: 70, y: 25 } },
]

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Low":
      return "bg-green-100 text-green-800 border-green-200"
    case "Medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "High":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function FootballPitch() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-green-400 to-green-500 rounded-lg overflow-hidden shadow-2xl">
        {/* Pitch markings */}
        <div className="absolute inset-0">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full opacity-60"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>

          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white opacity-60"></div>

          {/* Penalty areas */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-16 border-2 border-white border-b-0 opacity-60"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-16 border-2 border-white border-t-0 opacity-60"></div>

          {/* Goal areas */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-white border-b-0 opacity-60"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-white border-t-0 opacity-60"></div>

          {/* Corner arcs */}
          <div className="absolute top-0 left-0 w-8 h-8 border-2 border-white border-t-0 border-l-0 rounded-br-full opacity-60"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-2 border-white border-t-0 border-r-0 rounded-bl-full opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-2 border-white border-b-0 border-l-0 rounded-tr-full opacity-60"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-2 border-white border-b-0 border-r-0 rounded-tl-full opacity-60"></div>
        </div>

        {/* Player cards */}
        {players.map((player) => (
          <Card
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-28 md:w-32 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{
              left: `${player.position.x}%`,
              top: `${player.position.y}%`,
            }}
          >
            <CardContent className="p-2 sm:p-3 text-center">
              <div className="space-y-1">
                <h3 className="font-semibold text-xs sm:text-sm leading-tight text-gray-900">{player.name}</h3>
                <div className="text-lg sm:text-xl font-bold text-blue-600">{player.allocation}%</div>
                <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getRiskColor(player.riskLevel)}`}>
                  {player.riskLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Formation label */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-sm font-semibold text-gray-900">4-3-3 Formation</div>
          <div className="text-xs text-gray-600">Investment Portfolio</div>
        </div>

        {/* Total allocation */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-sm font-semibold text-gray-900">Total: 100%</div>
          <div className="text-xs text-gray-600">Allocated</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
          <span className="text-sm text-gray-600">Low Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
          <span className="text-sm text-gray-600">Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
          <span className="text-sm text-gray-600">High Risk</span>
        </div>
      </div>
    </div>
  )
}
