"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface ConnectWalletProps {
  onConnect: () => void
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
  return (
    <Button
      onClick={onConnect}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border border-purple-400/20"
    >
      <Wallet className="h-5 w-5" />
      Connect Wallet
    </Button>
  )
}

