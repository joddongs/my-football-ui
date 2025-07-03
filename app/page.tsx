"use client"

import { AuthProvider } from "../auth/auth-context"
import FootballManager from "../football-manager"

export default function Page() {
  return (
    <AuthProvider>
      <FootballManager />
    </AuthProvider>
  )
}
