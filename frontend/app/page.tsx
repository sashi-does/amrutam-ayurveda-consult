"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Clock, Shield, Leaf, Heart, CheckCircle } from "lucide-react"
import Link from "next/link"
import { DailyHealthProverb } from "@/components/daily-health-proverb"
import { useEffect, useState } from "react"
import { isAuthenticated, getUser, logout, type User } from "@/lib/auth"

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
    setUser(getUser())
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-700" />
            <span className="text-2xl font-bold text-green-700">Amrutam</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#about" className="text-gray-600 hover:text-green-700 transition-colors">
              About
            </Link>
            <Link href="#doctors" className="text-gray-600 hover:text-green-700 transition-colors">
              Doctors
            </Link>
            <Link href="#services" className="text-gray-600 hover:text-green-700 transition-colors">
              Services
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-green-700 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <span className="text-gray-700 hidden sm:inline">
                  Welcome, {user?.firstName || user?.email?.split("@")[0] || "User"}
                </span>
                <Link href="/dashboard">
                  <Button className="bg-green-700 hover:bg-green-800 text-white">Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    className="border-green-700 text-green-700 hover:bg-green-50 bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-green-700 hover:bg-green-800 text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-green-100 text-green-700 hover:bg-green-100">Trusted by 10,000+ Patients</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Experience Holistic Healing with <span className="text-green-700">Trusted Ayurvedic Experts</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with certified practitioners for personalized Ayurvedic consultations. Discover the power of nature
            in your wellness journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <Link href="/doctors">
                  <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 text-lg">
                    Find Doctors
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-green-700 text-green-700 hover:bg-green-50 px-8 py-3 text-lg bg-transparent"
                  >
                    My Appointments
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 text-lg">
                    Book Your First Consultation
                  </Button>
                </Link>
                <Link href="#doctors">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-green-700 text-green-700 hover:bg-green-50 px-8 py-3 text-lg bg-transparent"
                  >
                    Browse Doctors
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-green-700 mb-3" />
              <h3 className="font-semibold text-gray-900">500+ Certified Doctors</h3>
              <p className="text-gray-600">Expert practitioners verified and approved</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-green-700 mb-3" />
              <h3 className="font-semibold text-gray-900">24/7 Availability</h3>
              <p className="text-gray-600">Book consultations at your convenience</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-green-700 mb-3" />
              <h3 className="font-semibold text-gray-900">100% Secure</h3>
              <p className="text-gray-600">Your health data is completely protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Ayurvedic Medicine?</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Ayurveda is a 5,000-year-old system of natural healing that treats the root cause, not just symptoms. Our
              platform connects you with authentic practitioners who understand your unique constitution and health
              needs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <DailyHealthProverb />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-10 w-10 text-green-700 mb-2" />
                <CardTitle className="text-green-700">Holistic Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Treats mind, body, and spirit as interconnected systems for complete wellness.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Leaf className="h-10 w-10 text-green-700 mb-2" />
                <CardTitle className="text-green-700">Natural Remedies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Uses herbs, lifestyle changes, and natural therapies with minimal side effects.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-green-700 mb-2" />
                <CardTitle className="text-green-700">Personalized Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Customized treatment plans based on your unique body type and health condition.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section id="doctors" className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Expert Practitioners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our certified Ayurvedic doctors bring years of experience and deep knowledge of traditional healing
              practices.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Priya Sharma",
                specialization: "Ayurvedic Dermatology",
                experience: "12 years",
                rating: 4.9,
                image: "/female-ayurvedic-doctor.png",
              },
              {
                name: "Dr. Rajesh Kumar",
                specialization: "Panchakarma Specialist",
                experience: "15 years",
                rating: 4.8,
                image: "/male-ayurvedic-doctor.png",
              },
              {
                name: "Dr. Meera Patel",
                specialization: "Women's Health",
                experience: "10 years",
                rating: 4.9,
                image: "/female-ayurvedic-practitioner.png",
              },
            ].map((doctor, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-green-100">
                  <img
                    src={doctor.image || "/placeholder.svg"}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{doctor.name}</CardTitle>
                  <CardDescription className="text-green-700 font-medium">{doctor.specialization}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">{doctor.experience} experience</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-green-700 hover:bg-green-800">Book Consultation</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Healing Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Book your first consultation and embrace a healthier, more balanced life today. Our experts are here to
            guide you every step of the way.
          </p>
          {isLoggedIn ? (
            <Link href="/doctors">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Find Doctors
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Get Started Now
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold">Amrutam</span>
              </div>
              <p className="text-gray-400">
                Connecting you with authentic Ayurvedic healing for a healthier, more balanced life.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Online Consultations</li>
                <li>In-Person Visits</li>
                <li>Panchakarma Therapy</li>
                <li>Herbal Medicine</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Amrutam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
