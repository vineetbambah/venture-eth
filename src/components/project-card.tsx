"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Clock, User, Zap } from "lucide-react"

interface ProjectCardProps {
  project: {
    id: number
    creator: string
    title: string
    description: string
    goal: string
    currentAmount: string
    deadline: Date
    completed: boolean
  }
  onFund: (projectId: number, amount: string) => void
  userAddress: string
}

export default function ProjectCard({ project, onFund, userAddress }: ProjectCardProps) {
  const [fundAmount, setFundAmount] = useState("")

  const progress = (Number.parseFloat(project.currentAmount) / Number.parseFloat(project.goal)) * 100
  const isCreator = project.creator.toLowerCase() === userAddress.toLowerCase()
  const isExpired = new Date() > project.deadline
  const isCompleted = project.completed

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleFund = () => {
    if (fundAmount && Number.parseFloat(fundAmount) > 0) {
      onFund(project.id, fundAmount)
      setFundAmount("")
    }
  }

  return (
    <Card className="overflow-hidden border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none"></div>
      <CardHeader className="relative">
        <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-bl-full pointer-events-none"></div>
        <CardTitle className="text-xl font-bold text-white">{project.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-blue-200">
          <User className="h-4 w-4" />
          <span className="text-xs font-mono">
            {isCreator ? "Created by you" : `Creator: ${project.creator.slice(0, 6)}...${project.creator.slice(-4)}`}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <p className="text-sm text-gray-300">{project.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">
              Raised: <span className="text-blue-300 font-mono">{project.currentAmount} ETH</span>
            </span>
            <span className="text-gray-300">
              Goal: <span className="text-blue-300 font-mono">{project.goal} ETH</span>
            </span>
          </div>
          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <Progress value={progress} className="h-full bg-gradient-to-r from-purple-500 to-blue-500" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4 text-blue-400" />
          <span>
            {isExpired ? "Ended on " : "Ends on "}
            <span className="font-mono">{formatDate(project.deadline)}</span>
          </span>
        </div>

        {!isCompleted && !isExpired && !isCreator && (
          <div className="flex gap-2 mt-4">
            <Input
              type="number"
              placeholder="ETH Amount"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              min="0.001"
              step="0.001"
              className="bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Button
              onClick={handleFund}
              disabled={!fundAmount || Number.parseFloat(fundAmount) <= 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Fund
            </Button>
          </div>
        )}

        {(isCompleted || isExpired) && (
          <div className="bg-gray-800/70 p-2 rounded text-sm text-center border border-gray-700/50 font-mono">
            {isCompleted ? "This project has been completed" : "This project has expired"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

