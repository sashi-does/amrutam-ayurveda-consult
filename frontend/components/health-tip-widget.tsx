"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Clock, Leaf } from "lucide-react"

const quickHealthTips = [
  {
    tip: "Drink warm water first thing in the morning to kickstart your digestion.",
    category: "Morning Routine",
    duration: "2 min",
  },
  {
    tip: "Practice deep breathing for 5 minutes to reduce stress and improve focus.",
    category: "Mindfulness",
    duration: "5 min",
  },
  {
    tip: "Eat your largest meal at lunch when your digestive fire is strongest.",
    category: "Nutrition",
    duration: "Daily",
  },
  {
    tip: "Massage your feet with warm oil before bed for better sleep.",
    category: "Sleep",
    duration: "10 min",
  },
  {
    tip: "Chew your food slowly and mindfully to improve digestion.",
    category: "Eating Habits",
    duration: "During meals",
  },
  {
    tip: "Take a short walk after meals to aid digestion and circulation.",
    category: "Movement",
    duration: "10 min",
  },
]

export function HealthTipWidget() {
  const [currentTip, setCurrentTip] = useState(quickHealthTips[0])

  useEffect(() => {
    // Rotate tips every 30 seconds
    const interval = setInterval(() => {
      setCurrentTip(quickHealthTips[Math.floor(Math.random() * quickHealthTips.length)])
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getNewTip = () => {
    const availableTips = quickHealthTips.filter((tip) => tip.tip !== currentTip.tip)
    const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)]
    setCurrentTip(randomTip)
  }

  return (
    <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
          <Lightbulb className="h-5 w-5" />
          Quick Health Tip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-800 leading-relaxed">{currentTip.tip}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <Leaf className="h-3 w-3 mr-1" />
                {currentTip.category}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {currentTip.duration}
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={getNewTip}
              className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent"
            >
              New Tip
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
