"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"

interface CreateProjectFormProps {
  onSubmit: (projectData: {
    title: string
    description: string
    goal: string
    deadline: string
  }) => void
}

export default function CreateProjectForm({ onSubmit }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    deadline: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      title: "",
      description: "",
      goal: "",
      deadline: "",
    })
  }

  // Calculate minimum date (today)
  const today = new Date()
  today.setDate(today.getDate() + 1) // Minimum 1 day in the future
  const minDate = today.toISOString().split("T")[0]

  return (
    <Card className="border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none"></div>
      <CardHeader className="relative">
        <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-bl-full pointer-events-none"></div>
        <CardTitle className="text-xl font-bold text-white">Create a New Project</CardTitle>
        <CardDescription className="text-blue-200">
          Launch your crowdfunding campaign on the Ethereum blockchain
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">
              Project Title
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter project title"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal" className="text-gray-300">
              Funding Goal (ETH)
            </Label>
            <Input
              id="goal"
              name="goal"
              type="number"
              placeholder="0.1"
              min="0.01"
              step="0.01"
              value={formData.goal}
              onChange={handleChange}
              required
              className="bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-500 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-gray-300">
              Deadline
            </Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              min={minDate}
              value={formData.deadline}
              onChange={handleChange}
              required
              className="bg-gray-800/70 border-gray-700 text-white font-mono"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r mt-8 from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border border-purple-400/20"
          >
            <Zap className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

