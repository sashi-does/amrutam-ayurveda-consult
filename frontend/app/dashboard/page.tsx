"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DailyHealthProverb } from "@/components/daily-health-proverb"
import { HealthTipWidget } from "@/components/health-tip-widget"
import {
  Calendar,
  Clock,
  UserIcon,
  Video,
  MapPin,
  Star,
  Plus,
  Filter,
  Loader2,
  Leaf,
  LogOut,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { makeAuthenticatedRequest, getUser, logout } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  slotId: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  mode: "online" | "in_person"
  consultationFee: string
  symptoms: string | null
  meetingLink: string | null
  confirmedAt: string | null
  createdAt: string
  updatedAt: string
  slot: {
    id: string
    doctorId: string
    startTime: string
    endTime: string
    createdAt: string
    updatedAt: string
    doctor: {
      id: string
      userId: string
      specialization: string
      experience: number
      consultationFee: string
      qualifications: { degree: string; institution: string; year: number }[]
      bio: string
      rating: string
      totalReviews: number
      mode: "online" | "in_person"
      isActive: boolean
      isApproved: boolean
      createdAt: string
      updatedAt: string
    }
  }
}

interface DashboardUser {
  id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    const userData = getUser()
    if (userData) {
      setUser(userData)
    }
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, activeFilter])

  const fetchAppointments = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await makeAuthenticatedRequest("http://localhost:3000/api/v1/auth/appointments")

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.appointments) {
          setAppointments(data.appointments)
        }
      } else {
        setError("Failed to load appointments")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    switch (activeFilter) {
      case "upcoming":
        filtered = appointments.filter(
          (apt) =>
            apt.status === "confirmed" || (apt.status === "pending" && new Date(apt.slot.startTime) > new Date()),
        )
        break
      case "completed":
        filtered = appointments.filter((apt) => apt.status === "completed")
        break
      case "cancelled":
        filtered = appointments.filter((apt) => apt.status === "cancelled")
        break
      case "pending":
        filtered = appointments.filter((apt) => apt.status === "pending")
        break
      default:
        filtered = appointments
    }

    // Sort by appointment date
    filtered.sort((a, b) => new Date(b.slot.startTime).getTime() - new Date(a.slot.startTime).getTime())
    setFilteredAppointments(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }

  const canReschedule = (appointment: Appointment) => {
    const appointmentTime = new Date(appointment.slot.startTime)
    const now = new Date()
    const timeDiff = appointmentTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)

    return hoursDiff > 24 && (appointment.status === "confirmed" || appointment.status === "pending")
  }

  const getUpcomingAppointments = () => {
    return appointments.filter(
      (apt) => (apt.status === "confirmed" || apt.status === "pending") && new Date(apt.slot.startTime) > new Date(),
    ).length
  }

  const getCompletedAppointments = () => {
    return appointments.filter((apt) => apt.status === "completed").length
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-700" />
              <span className="text-2xl font-bold text-green-700">Amrutam</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-green-700 transition-colors">
                Home
              </Link>
              <Link href="/doctors" className="text-gray-600 hover:text-green-700 transition-colors">
                Find Doctors
              </Link>
              <Link href="/dashboard" className="text-green-700 font-medium">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h1>
                <p className="text-gray-600">Manage your appointments and track your wellness journey</p>
              </div>
              <Link href="/doctors">
                <Button className="bg-green-700 hover:bg-green-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Book New Appointment
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-8">
            <DailyHealthProverb showRefresh={true} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming Appointments</p>
                    <p className="text-3xl font-bold text-green-700">{getUpcomingAppointments()}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-700" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed Sessions</p>
                    <p className="text-3xl font-bold text-blue-700">{getCompletedAppointments()}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-700" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-700">{appointments.length}</p>
                  </div>
                  <UserIcon className="h-8 w-8 text-gray-700" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="border-green-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-green-700">My Appointments</CardTitle>
                      <CardDescription>View and manage your consultation appointments</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Filter by status</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeFilter} className="mt-6">
                      {error && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                          <AlertDescription className="text-red-700">{error}</AlertDescription>
                        </Alert>
                      )}

                      {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-green-700" />
                          <span className="ml-2 text-gray-600">Loading appointments...</span>
                        </div>
                      ) : filteredAppointments.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                          <p className="text-gray-600 mb-4">
                            {activeFilter === "all"
                              ? "You haven't booked any appointments yet."
                              : `No ${activeFilter} appointments found.`}
                          </p>
                          <Link href="/doctors">
                            <Button className="bg-green-700 hover:bg-green-800">Book Your First Appointment</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredAppointments.map((appointment) => {
                            const { date, time } = formatDateTime(appointment.slot.startTime)
                            const doctor = appointment.slot.doctor

                            return (
                              <Card key={appointment.id} className="border-gray-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                      <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-green-100 text-green-700">Dr</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h3 className="font-semibold text-gray-900">
                                            Dr. {doctor.userId} {/* Note: API doesn't return doctor's name directly */}
                                          </h3>
                                          {getStatusBadge(appointment.status)}
                                        </div>
                                        <p className="text-green-700 text-sm font-medium mb-2">
                                          {doctor.specialization}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                          <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {date}
                                          </div>
                                          <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {time}
                                          </div>
                                          <Badge
                                            variant={appointment.mode === "online" ? "default" : "secondary"}
                                            className={
                                              appointment.mode === "online"
                                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                : "bg-green-100 text-green-700 hover:bg-green-100"
                                            }
                                          >
                                            {appointment.mode === "online" ? (
                                              <>
                                                <Video className="h-3 w-3 mr-1" />
                                                Online
                                              </>
                                            ) : (
                                              <>
                                                <MapPin className="h-3 w-3 mr-1" />
                                                In-Person
                                              </>
                                            )}
                                          </Badge>
                                        </div>
                                        {appointment.symptoms && (
                                          <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                                          </p>
                                        )}
                                        <div className="flex items-center">
                                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                          <span className="text-sm font-medium">
                                            {Number.parseFloat(doctor.rating).toFixed(1)}
                                          </span>
                                          <span className="text-sm text-gray-500 ml-1">
                                            ({doctor.totalReviews} reviews)
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-green-700 mb-2">
                                        ₹{appointment.consultationFee}
                                      </div>
                                      <div className="space-y-2">
                                        {appointment.status === "confirmed" && appointment.mode === "online" && (
                                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <Video className="h-3 w-3 mr-1" />
                                            Join Call
                                          </Button>
                                        )}
                                        {canReschedule(appointment) && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent"
                                          >
                                            Reschedule
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Health Tips Sidebar */}
            <div className="space-y-6">
              <HealthTipWidget />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
