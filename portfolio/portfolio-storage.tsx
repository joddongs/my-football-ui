"use client"

import type { Player } from "../football-manager"

export interface SavedPortfolio {
  id: string
  userId: string
  name: string
  formation: string
  players: Player[]
  createdAt: string
  updatedAt: string
}

export class PortfolioStorage {
  private static getStorageKey(userId: string): string {
    return `football-portfolio-${userId}`
  }

  static savePortfolio(
    userId: string,
    portfolio: Omit<SavedPortfolio, "id" | "userId" | "createdAt" | "updatedAt">,
  ): string {
    const portfolios = this.getPortfolios(userId)
    const now = new Date().toISOString()

    const newPortfolio: SavedPortfolio = {
      id: Date.now().toString(),
      userId,
      ...portfolio,
      createdAt: now,
      updatedAt: now,
    }

    portfolios.push(newPortfolio)
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(portfolios))

    return newPortfolio.id
  }

  static updatePortfolio(
    userId: string,
    portfolioId: string,
    updates: Partial<Pick<SavedPortfolio, "name" | "formation" | "players">>,
  ): boolean {
    const portfolios = this.getPortfolios(userId)
    const index = portfolios.findIndex((p) => p.id === portfolioId)

    if (index === -1) return false

    portfolios[index] = {
      ...portfolios[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(portfolios))
    return true
  }

  static getPortfolios(userId: string): SavedPortfolio[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId))
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load portfolios:", error)
      return []
    }
  }

  static getPortfolio(userId: string, portfolioId: string): SavedPortfolio | null {
    const portfolios = this.getPortfolios(userId)
    return portfolios.find((p) => p.id === portfolioId) || null
  }

  static deletePortfolio(userId: string, portfolioId: string): boolean {
    const portfolios = this.getPortfolios(userId)
    const filtered = portfolios.filter((p) => p.id !== portfolioId)

    if (filtered.length === portfolios.length) return false

    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(filtered))
    return true
  }

  // 자동 저장 기능
  static autoSave(userId: string, name: string, formation: string, players: Player[]): void {
    const portfolios = this.getPortfolios(userId)
    const autoSavePortfolio = portfolios.find((p) => p.name === "자동 저장")

    if (autoSavePortfolio) {
      this.updatePortfolio(userId, autoSavePortfolio.id, {
        formation,
        players,
      })
    } else {
      this.savePortfolio(userId, {
        name: "자동 저장",
        formation,
        players,
      })
    }
  }
}
