"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, MapPin, Video, Clock, Award, Calendar, ArrowLeft, Loader2, Leaf } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

interface Doctor {
  id: string
  userId: string
  specialization: string
  experience: number
  consultationFee: string
  qualifications: string[] | { degree: string; institution: string; year: number }[]
  bio: string
  rating: string
  totalReviews: number
  mode: "online" | "in_person"
  isActive: boolean
  isApproved: boolean
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
}

interface Slot {
  id: string
  doctorId: string
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (doctorId) {
      fetchDoctorProfile()
      fetchDoctorSlots()
    }
  }, [doctorId])

  const fetchDoctorProfile = async () => {
    try {
      // Since we don't have a single doctor endpoint, we'll fetch from the doctors list
      // In a real app, you'd have a dedicated endpoint for single doctor
      const response = await fetch(`${process.env.BASE_URL}/api/v1/doctors/all`)
      const data = await response.json()

      if (data.doctors) {
        const foundDoctor = data.doctors.find((d: Doctor) => d.id === doctorId)
        if (foundDoctor) {
          setDoctor(foundDoctor)
        } else {
          setError("Doctor not found")
        }
      }
    } catch (err) {
      setError("Failed to load doctor profile")
    }
  }

  const fetchDoctorSlots = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/v1/doctors/slot/all?doctorId=${doctorId}`)
      const data = await response.json()

      if (data.success && data.slots) {
        setSlots(data.slots)
      }
    } catch (err) {
      console.warn("Failed to load doctor slots")
    } finally {
      setIsLoading(false)
    }
  }

  const formatQualifications = (qualifications: string[] | { degree: string; institution: string; year: number }[]) => {
    if (Array.isArray(qualifications) && qualifications.length > 0) {
      if (typeof qualifications[0] === "string") {
        return qualifications as string[]
      } else {
        return (qualifications as { degree: string; institution: string; year: number }[]).map(
          (q) => `${q.degree} - ${q.institution} (${q.year})`,
        )
      }
    }
    return ["Not specified"]
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }

  const handleBookConsultation = () => {
    if (!isAuthenticated()) {
      router.push("/auth/signin")
      return
    }
    router.push(`/booking/${doctorId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
        <span className="ml-2 text-gray-600">Loading doctor profile...</span>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Alert className="border-red-200 bg-red-50 max-w-md mx-auto">
            <AlertDescription className="text-red-700">{error || "Doctor not found"}</AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Link href="/doctors">
              <Button className="bg-green-700 hover:bg-green-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Doctors
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-700" />
            <span className="text-2xl font-bold text-green-700">Amrutam</span>
          </Link>
          <Link href="/doctors">
            <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Profile */}
          <div className="lg:col-span-2">
            <Card className="border-green-100">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl text-gray-900 mb-2">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </CardTitle>
                    <CardDescription className="text-xl text-green-700 font-medium mb-4">
                      {doctor.specialization}
                    </CardDescription>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge
                        variant={doctor.mode === "online" ? "default" : "secondary"}
                        className={
                          doctor.mode === "online"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            : "bg-green-100 text-green-700 hover:bg-green-100"
                        }
                      >
                        {doctor.mode === "online" ? (
                          <>
                            <Video className="h-3 w-3 mr-1" />
                            Online Consultation
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 mr-1" />
                            In-Person Visit
                          </>
                        )}
                      </Badge>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{Number.parseFloat(doctor.rating).toFixed(1)}</span>
                        <span className="text-gray-500 ml-1">({doctor.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-green-700 mr-2" />
                      <span className="text-gray-600">{doctor.experience} years of experience</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-green-700 mr-2" />
                      <span className="text-gray-600">Certified Ayurvedic Practitioner</span>
                    </div>
                  </div>

                  {doctor.bio && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications</h3>
                    <div className="space-y-2">
                      {formatQualifications(doctor.qualifications).map((qualification, index) => (
                        <div key={index} className="flex items-center">
                          <Award className="h-4 w-4 text-green-700 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{qualification}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div>
            <Card className="border-green-100 sticky top-8">
              <CardHeader>
                <CardTitle className="text-green-700">Book Consultation</CardTitle>
                <CardDescription>Schedule your appointment with Dr. {doctor.user.firstName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-green-700">₹{doctor.consultationFee}</span>
                    <span className="text-gray-500 ml-1">per session</span>
                  </div>

                  {slots.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Available Slots</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {slots.slice(0, 3).map((slot) => {
                          const { date, time } = formatDateTime(slot.startTime)
                          return (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between text-sm p-2 bg-green-50 rounded"
                            >
                              <div>
                                <div className="font-medium">{date}</div>
                                <div className="text-gray-600">{time}</div>
                              </div>
                              <Calendar className="h-4 w-4 text-green-700" />
                            </div>
                          )
                        })}
                      </div>
                      {slots.length > 3 && (
                        <p className="text-sm text-gray-500 mt-2">+{slots.length - 3} more slots available</p>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleBookConsultation}
                    className="w-full bg-green-700 hover:bg-green-800 text-white"
                  >
                    Book Consultation
                  </Button>

                  <div className="text-xs text-gray-500 text-center">Secure booking • Instant confirmation</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
