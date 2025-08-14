// API configuration and utilities
const API_BASE_URL = process.env.BASE_URL || "http://localhost:3000"

export const apiEndpoints = {
  auth: {
    signin: `${API_BASE_URL}/api/v1/auth/signin`,
    signup: `${API_BASE_URL}/api/v1/auth/signup`,
    verifyOtp: `${API_BASE_URL}/api/v1/auth/otp/verify`,
    sendOtp: `${API_BASE_URL}/api/v1/auth/otp/send`,
  },
  doctors: {
    list: `${API_BASE_URL}/api/v1/doctors/all`,
    slots: (doctorId: string) => `${API_BASE_URL}/api/v1/doctors/slot/all?doctorId=${doctorId}`,
  },
  appointments: {
    create: `${API_BASE_URL}/api/v1/auth/appointments/create`,
    list: `${API_BASE_URL}/api/v1/auth/appointments`,
  },
}

export const makeApiRequest = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    // Handle different types of errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Unable to connect to server. Please check if the backend is running.")
    }
    throw error
  }
}

export const buildDoctorsUrl = (specialization?: string, mode?: string) => {
  const params = new URLSearchParams()
  if (specialization) params.append("specialisation", specialization)
  if (mode) params.append("mode", mode)

  const queryString = params.toString()
  return `${apiEndpoints.doctors.list}${queryString ? `?${queryString}` : ""}`
}
