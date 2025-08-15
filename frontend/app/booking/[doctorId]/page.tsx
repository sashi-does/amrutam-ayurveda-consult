"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Leaf,
  Video,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { makeAuthenticatedRequest } from "@/lib/auth"

interface Doctor {
  id: string
  userId: string
  specialization: string
  experience: number
  consultationFee: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
  mode: "online" | "in_person"
}

interface Slot {
  id: string
  doctorId: string
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

interface BookingData {
  doctorId: string
  slotId: string
  status: string
  mode: "online" | "in_person"
  consultationFee: number
  symptoms: string
  meetingLink?: string
}

type BookingStep = "slot-selection" | "booking-details" | "otp-verification" | "confirmation"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.doctorId as string

  const [currentStep, setCurrentStep] = useState<BookingStep>("slot-selection")
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookingData, setBookingData] = useState<BookingData>({
    doctorId,
    slotId: "",
    status: "pending",
    mode: "online",
    consultationFee: 0,
    symptoms: "",
    meetingLink: "",
  })
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [slotLockTimer, setSlotLockTimer] = useState(0)

  useEffect(() => {
    if (doctorId) {
      fetchDoctorAndSlots()
    }
  }, [doctorId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (slotLockTimer > 0) {
      interval = setInterval(() => {
        setSlotLockTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [slotLockTimer])

  const fetchDoctorAndSlots = async () => {
    setIsLoading(true)
    setError("")

    try {
      const doctorResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/doctors/all`)
      const doctorData = await doctorResponse.json()

      if (doctorData.doctors) {
        const foundDoctor = doctorData.doctors.find((d: Doctor) => d.id === doctorId)
        if (foundDoctor) {
          setDoctor(foundDoctor)
          setBookingData((prev) => ({
            ...prev,
            mode: foundDoctor.mode,
            consultationFee: Number.parseFloat(foundDoctor.consultationFee),
          }))
        } else {
          setError("Doctor not found")
          return
        }
      }

      const slotsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/doctors/slot/all?doctorId=${doctorId}`)
      const slotsData = await slotsResponse.json()
      console.log(slotsData.slots)

      if (slotsData.success && slotsData.slots) {
        setSlots(slotsData.slots)
      }
    } catch (err) {
      setError("Failed to load booking information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSlotSelection = (slot: Slot) => {
    setSelectedSlot(slot)
    setBookingData((prev) => ({ ...prev, slotId: slot.id }))
    setSlotLockTimer(600) 
  }

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
  }

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false
    return slots.some(slot => {
      const slotDate = new Date(slot.startTime)
      return slotDate.toDateString() === date.toDateString()
    })
  }

  const isDateSelected = (date: Date | null) => {
    if (!date) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isPastDate = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    // Only dates BEFORE today are past dates - today and future are allowed
    return compareDate < today
  }

  // Filter slots based on selected date
  const filteredSlots = slots.filter(slot => {
    const slotDate = new Date(slot.startTime)
    return slotDate.toDateString() === selectedDate.toDateString()
  })

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/appointments/create`, {
        method: "POST",
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (data.success || response.ok) {
        // Send OTP
        await sendOTP()
        setCurrentStep("otp-verification")
      } else {
        setError(data.error || "Failed to create appointment")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendOTP = async () => {
    try {
      await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/otp/send`, {
        method: "POST",
      })
    } catch (err) {
      console.warn("Failed to send OTP")
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/otp/verify`, {
        method: "POST",
        headers: {
          otp: otpCode,
        },
      })

      const data = await response.json()

      if (data.success === "true" || data.success === true) {
        setCurrentStep("confirmation")
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch (err) {
      setError("OTP verification failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
        <span className="ml-2 text-gray-600">Loading booking information...</span>
      </div>
    )
  }

  if (error && !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Alert className="border-red-200 bg-red-50 max-w-md mx-auto">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
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
          <Link href={`/doctors/${doctorId}`}>
            <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: "slot-selection", label: "Select Slot", icon: Calendar },
              { key: "booking-details", label: "Booking Details", icon: FileText },
              { key: "otp-verification", label: "Verify OTP", icon: CheckCircle },
              { key: "confirmation", label: "Confirmation", icon: CheckCircle },
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.key
              const isCompleted =
                (currentStep === "booking-details" && step.key === "slot-selection") ||
                (currentStep === "otp-verification" &&
                  (step.key === "slot-selection" || step.key === "booking-details")) ||
                (currentStep === "confirmation" && step.key !== "confirmation")

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "border-green-700 bg-green-700 text-white"
                        : isCompleted
                          ? "border-green-700 bg-green-100 text-green-700"
                          : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive || isCompleted ? "text-green-700" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < 3 && <div className="w-16 h-px bg-gray-300 mx-4" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Doctor Info Card */}
        {doctor && (
          <Card className="max-w-4xl mx-auto mb-6 border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </h3>
                    <p className="text-green-700 text-sm">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">₹{doctor.consultationFee}</div>
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slot Lock Timer */}
        {slotLockTimer > 0 && selectedSlot && currentStep !== "confirmation" && (
          <Alert className="max-w-4xl mx-auto mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Slot reserved for {formatTimer(slotLockTimer)}. Please complete your booking before the timer expires.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="max-w-4xl mx-auto mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === "slot-selection" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calendar Component */}
              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Calendar className="h-5 w-5" />
                    Select Date
                  </CardTitle>
                  <CardDescription>Choose a date to view available slots</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      onClick={() => navigateMonth(-1)}
                      className="p-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => navigateMonth(1)}
                      className="p-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentMonth).map((date, index) => {
                      const hasSlots = isDateAvailable(date)
                      const isSelected = isDateSelected(date)
                      const isPast = isPastDate(date)
                      
                      return (
                        <button
                          key={index}
                          onClick={() => date && !isPast && setSelectedDate(date)}
                          disabled={!date || isPast || !hasSlots}
                          className={`
                            p-2 text-sm rounded-md transition-all h-10
                            ${!date ? 'invisible' : ''}
                            ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                            ${hasSlots && !isPast ? 'hover:bg-green-50 cursor-pointer' : ''}
                            ${!hasSlots && !isPast ? 'text-gray-400 cursor-not-allowed' : ''}
                            ${isSelected ? 'bg-green-600 text-white' : ''}
                            ${hasSlots && !isSelected && !isPast ? 'bg-green-100 text-green-700' : ''}
                          `}
                        >
                          {date && date.getDate()}
                          {hasSlots && !isSelected && (
                            <div className="w-1 h-1 bg-green-600 rounded-full mx-auto mt-0.5"></div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-4 text-xs text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-100 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-600 rounded"></div>
                        <span>Selected</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots Component */}
              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Clock className="h-5 w-5" />
                    Available Slots
                  </CardTitle>
                  <CardDescription>
                    {selectedDate.toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {slots.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No slots available</h3>
                      <p className="text-gray-600">Please select a different date or contact the doctor directly.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {slots.map((slot) => {
                        const { time } = formatDateTime(slot.startTime)
                        const isSelected = selectedSlot?.id === slot.id
                    
                        return (
                          <Card
                            key={slot.id}
                            className={`cursor-pointer transition-all hover:shadow-sm rounded-lg ${
                              isSelected ? "border-green-600 bg-green-50" : "border-gray-200"
                            }`}
                            onClick={() => handleSlotSelection(slot)}
                          >
                            <CardContent className="p-3 flex items-center justify-center">
                              <span className="text-green-700 font-medium text-sm">{time}</span>
                              {isSelected && <CheckCircle className="h-4 w-4 text-green-700 ml-2" />}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="mt-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-green-800 mb-1">Selected Appointment</h4>
                        <p className="text-green-700 text-sm">
                          {selectedDate.toLocaleDateString('en-IN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} at {formatDateTime(selectedSlot.startTime).time}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={async () => {
                            setIsSubmitting(true)
                            setError("")
                            
                            try {
                              const response = await makeAuthenticatedRequest(
                                `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/lock-slot`,
                                {
                                  method: "POST",
                                  body: JSON.stringify({
                                    slotId: selectedSlot.id,
                                    doctorId: doctorId
                                  })
                                }
                              )
                              
                              const data = await response.json()
                              
                              if (data.success || response.ok) {
                                setCurrentStep("booking-details")
                              } else {
                                setError(data.error || "Failed to lock slot. Please try again.")
                              }
                            } catch (err) {
                              setError("Network error. Please try again.")
                            } finally {
                              setIsSubmitting(false)
                            }
                          }}
                          disabled={isSubmitting}
                          className="bg-green-700 hover:bg-green-800"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Reserving Slot...
                            </>
                          ) : (
                            "Continue to Booking Details"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "booking-details" && (
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  Booking Details
                </CardTitle>
                <CardDescription>Provide additional information for your consultation</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {selectedSlot && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Selected Appointment</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDateTime(selectedSlot.startTime).date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDateTime(selectedSlot.startTime).time}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms / Reason for Consultation *</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Please describe your symptoms or reason for consultation..."
                      value={bookingData.symptoms}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, symptoms: e.target.value }))}
                      required
                      className="border-green-200 focus:border-green-500 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Consultation Mode</Label>
                    <Select
                      value={bookingData.mode}
                      onValueChange={(value: "online" | "in_person") =>
                        setBookingData((prev) => ({ ...prev, mode: value }))
                      }
                    >
                      <SelectTrigger className="border-green-200 focus:border-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online Consultation</SelectItem>
                        <SelectItem value="in_person">In-Person Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {bookingData.mode === "online" && (
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                      <Input
                        id="meetingLink"
                        placeholder="Zoom/Google Meet link (if you have a preference)"
                        value={bookingData.meetingLink}
                        onChange={(e) => setBookingData((prev) => ({ ...prev, meetingLink: e.target.value }))}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Consultation Fee:</span>
                        <span className="font-medium">₹{bookingData.consultationFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span className="font-medium">₹0</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-green-700">₹{bookingData.consultationFee}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("slot-selection")}
                      className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent"
                    >
                      Back to Slots
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-green-700 hover:bg-green-800">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {currentStep === "otp-verification" && (
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Verify OTP
                </CardTitle>
                <CardDescription>Enter the OTP sent to your registered email address</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOTPVerification} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP *</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      maxLength={6}
                      className="border-green-200 focus:border-green-500 text-center text-lg tracking-widest"
                    />
                  </div>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={sendOTP}
                      className="text-green-700 hover:text-green-800"
                    >
                      Resend OTP
                    </Button>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("booking-details")}
                      className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent"
                    >
                      Back to Details
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-green-700 hover:bg-green-800">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {currentStep === "confirmation" && (
            <Card className="border-green-100">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-700" />
                </div>
                <CardTitle className="text-2xl text-green-700">Booking Confirmed!</CardTitle>
                <CardDescription>Your appointment has been successfully booked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Appointment Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Doctor:</span>
                        <div className="font-medium">
                          Dr. {doctor?.user.firstName} {doctor?.user.lastName}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Specialization:</span>
                        <div className="font-medium">{doctor?.specialization}</div>
                      </div>
                      {selectedSlot && (
                        <>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <div className="font-medium">{formatDateTime(selectedSlot.startTime).date}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <div className="font-medium">{formatDateTime(selectedSlot.startTime).time}</div>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="text-gray-600">Mode:</span>
                        <div className="font-medium capitalize">{bookingData.mode.replace("_", "-")}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount Paid:</span>
                        <div className="font-medium text-green-700">₹{bookingData.consultationFee}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      You will receive a confirmation email and SMS with appointment details shortly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/dashboard">
                        <Button className="bg-green-700 hover:bg-green-800">View My Appointments</Button>
                      </Link>
                      <Link href="/doctors">
                        <Button
                          variant="outline"
                          className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent"
                        >
                          Book Another Appointment
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}