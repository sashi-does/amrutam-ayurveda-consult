"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, MapPin, Video, User, Clock, Search, Filter, Loader2, Leaf, LogOut, Bell, Settings } from "lucide-react"
import Link from "next/link"
import { logout } from "@/lib/auth"

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

const specializations = [
  "All Specializations",
  "Ayurvedic Dermatology",
  "Panchakarma Specialist",
  "Women's Health",
  "Cardiology",
  "Digestive Health",
  "Mental Wellness",
  "Joint & Bone Health",
  "Respiratory Health",
  "General Medicine",
]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations")
  const [selectedMode, setSelectedMode] = useState("all")

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchTerm, selectedSpecialization, selectedMode])

  const fetchDoctors = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Fetch doctors for different specializations to get a variety
      const specializations = ["Cardiology", "Ayurvedic Dermatology", "Panchakarma Specialist"]
      const modes = ["online", "in_person"]
      console.log(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/doctors/all?specialisation`,)
      let allDoctors: Doctor[] = []

      for (const spec of specializations) {
        for (const mode of modes) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/doctors/all?specialisation=${encodeURIComponent(spec)}&mode=${mode}`,
            )
            const data = await response.json()
            if (data.doctors) {
              allDoctors = [...allDoctors, ...data.doctors]
            }
          } catch (err) {
            // Continue with other requests even if one fails
            console.warn(`Failed to fetch doctors for ${spec} - ${mode}`)
          }
        }
      }

      // Remove duplicates based on doctor ID
      const uniqueDoctors = allDoctors.filter(
        (doctor, index, self) => index === self.findIndex((d) => d.id === doctor.id),
      )

      setDoctors(uniqueDoctors)
    } catch (err) {
      setError("Failed to load doctors. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSpecialization !== "All Specializations") {
      filtered = filtered.filter((doctor) => doctor.specialization === selectedSpecialization)
    }

    if (selectedMode !== "all") {
      filtered = filtered.filter((doctor) => doctor.mode === selectedMode)
    }

    setFilteredDoctors(filtered)
  }

  const formatQualifications = (qualifications: string[] | { degree: string; institution: string; year: number }[]) => {
    if (Array.isArray(qualifications) && qualifications.length > 0) {
      if (typeof qualifications[0] === "string") {
        return (qualifications as string[]).join(", ")
      } else {
        return (qualifications as { degree: string; institution: string; year: number }[])
          .map((q) => q.degree)
          .join(", ")
      }
    }
    return "Not specified"
  }

  return (
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
                onClick={() => logout()}
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Ayurvedic Doctor</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with certified Ayurvedic practitioners who specialize in holistic healing and natural wellness
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Search className="h-5 w-5" />
              Search & Filter Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search by name or specialization</Label>
                <Input
                  id="search"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="border-green-200 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Consultation Mode</Label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="border-green-200 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in_person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-700" />
            <span className="ml-2 text-gray-600">Loading doctors...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {filteredDoctors.length} Doctor{filteredDoctors.length !== 1 ? "s" : ""} Found
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                Showing results for your search
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all available doctors.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedSpecialization("All Specializations")
                      setSelectedMode("all")
                    }}
                    className="bg-green-700 hover:bg-green-800"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow border-green-100">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900">
                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                          </CardTitle>
                          <CardDescription className="text-green-700 font-medium">
                            {doctor.specialization}
                          </CardDescription>
                        </div>
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
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-600">{doctor.experience} years exp.</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium">{Number.parseFloat(doctor.rating).toFixed(1)}</span>
                            <span className="text-gray-500 ml-1">({doctor.totalReviews})</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Qualifications:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatQualifications(doctor.qualifications)}
                          </p>
                        </div>

                        {doctor.bio && <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>}

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-lg font-bold text-green-700">₹{doctor.consultationFee}</span>
                            <span className="text-sm text-gray-500 ml-1">per session</span>
                          </div>
                          <Link href={`/doctors/${doctor.id}`}>
                            <Button className="bg-green-700 hover:bg-green-800 text-white">View Profile</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
