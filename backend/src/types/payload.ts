export interface UserPayload {
    id: string,
    email: string,
    role: 'patient' | 'doctor' | 'admin',
}