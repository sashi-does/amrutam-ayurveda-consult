"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, RefreshCw } from "lucide-react"

const ayurvedicProverbs = [
  {
    text: "When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need.",
    author: "Ancient Ayurvedic Wisdom",
    category: "Nutrition",
  },
  {
    text: "The body benefits from movement, and the mind benefits from stillness.",
    author: "Ayurvedic Teaching",
    category: "Balance",
  },
  {
    text: "Prevention is better than cure. A healthy lifestyle is the foundation of wellness.",
    author: "Charaka Samhita",
    category: "Prevention",
  },
  {
    text: "Like increases like, and opposites balance. Choose foods and activities that complement your nature.",
    author: "Ayurvedic Principle",
    category: "Constitution",
  },
  {
    text: "The mind is the king of the senses, and breath is the king of the mind.",
    author: "Hatha Yoga Pradipika",
    category: "Mindfulness",
  },
  {
    text: "Early to bed and early to rise makes a person healthy, wealthy, and wise.",
    author: "Ayurvedic Lifestyle",
    category: "Routine",
  },
  {
    text: "Food is medicine, and medicine is food when chosen with wisdom.",
    author: "Ancient Ayurveda",
    category: "Healing",
  },
  {
    text: "A calm mind is the ultimate weapon against your challenges.",
    author: "Ayurvedic Philosophy",
    category: "Mental Health",
  },
  {
    text: "Listen to your body's wisdom. It knows what it needs for healing.",
    author: "Traditional Ayurveda",
    category: "Intuition",
  },
  {
    text: "Moderation in all things brings harmony to body, mind, and spirit.",
    author: "Ayurvedic Balance",
    category: "Moderation",
  },
  {
    text: "The season of your life determines the medicine you need.",
    author: "Seasonal Ayurveda",
    category: "Seasons",
  },
  {
    text: "Gratitude is the best medicine for a troubled heart.",
    author: "Ayurvedic Wisdom",
    category: "Gratitude",
  },
  {
    text: "Strong digestion is the root of good health and vitality.",
    author: "Ayurvedic Medicine",
    category: "Digestion",
  },
  {
    text: "Sleep is the golden chain that ties health and our bodies together.",
    author: "Ayurvedic Rest",
    category: "Sleep",
  },
  {
    text: "Nature does not hurry, yet everything is accomplished in its time.",
    author: "Natural Healing",
    category: "Patience",
  },
]

interface DailyHealthProverbProps {
  className?: string
  showRefresh?: boolean
}

export function DailyHealthProverb({ className = "", showRefresh = false }: DailyHealthProverbProps) {
  const [currentProverb, setCurrentProverb] = useState(ayurvedicProverbs[0])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDailyProverb()
  }, [])

  const loadDailyProverb = () => {
    setIsLoading(true)

    // Get today's date as a string (YYYY-MM-DD)
    const today = new Date().toDateString()

    // Check if we have a proverb for today
    const storedData = localStorage.getItem("dailyHealthProverb")

    if (storedData) {
      try {
        const { date, proverbIndex } = JSON.parse(storedData)

        // If it's the same day, use the stored proverb
        if (date === today) {
          setCurrentProverb(ayurvedicProverbs[proverbIndex])
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.warn("Error parsing stored proverb data")
      }
    }

    // Generate a new proverb for today
    generateDailyProverb(today)
  }

  const generateDailyProverb = (dateString: string) => {
    // Use date as seed for consistent daily selection
    const dateHash = dateString.split("").reduce((hash, char) => {
      return (hash << 5) - hash + char.charCodeAt(0)
    }, 0)

    // Get a consistent index based on the date
    const proverbIndex = Math.abs(dateHash) % ayurvedicProverbs.length
    const selectedProverb = ayurvedicProverbs[proverbIndex]

    // Store for today
    localStorage.setItem(
      "dailyHealthProverb",
      JSON.stringify({
        date: dateString,
        proverbIndex,
      }),
    )

    setCurrentProverb(selectedProverb)
    setIsLoading(false)
  }

  const refreshProverb = () => {
    // Get a random proverb (for manual refresh)
    const randomIndex = Math.floor(Math.random() * ayurvedicProverbs.length)
    setCurrentProverb(ayurvedicProverbs[randomIndex])
  }

  if (isLoading) {
    return (
      <Card className={`border-green-100 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-green-100 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-green-100 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-green-100 bg-gradient-to-br from-green-50 to-white ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-700" />
            <span className="text-sm font-medium text-green-700">Daily Wellness Wisdom</span>
          </div>
          {showRefresh && (
            <button
              onClick={refreshProverb}
              className="text-green-600 hover:text-green-700 transition-colors"
              title="Get another proverb"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>

        <blockquote className="text-gray-800 text-lg leading-relaxed mb-4 italic">"{currentProverb.text}"</blockquote>

        <div className="flex items-center justify-between">
          <cite className="text-sm text-gray-600 not-italic">— {currentProverb.author}</cite>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{currentProverb.category}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
