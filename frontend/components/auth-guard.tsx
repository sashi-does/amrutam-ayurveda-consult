"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuthed(authenticated)

      if (requireAuth && !authenticated) {
        router.push("/auth/signin")
        return
      }

      if (!requireAuth && authenticated) {
        router.push("/dashboard")
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [requireAuth, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    )
  }

  if (requireAuth && !isAuthed) {
    return null
  }

  if (!requireAuth && isAuthed) {
    return null
  }

  return <>{children}</>
}
