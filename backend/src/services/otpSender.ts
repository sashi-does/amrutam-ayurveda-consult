import { Resend } from 'resend';


const AMRUTAM_MAIL_KEY = process.env.AMRUTAM_MAIL_KEY
const resend = new Resend(AMRUTAM_MAIL_KEY);


export async function sendOtpMail(email: string, otp: string) {
    try {
      const { error } = await resend.emails.send({
        from: "Amrutam <onboarding@resend.dev>",
        to: [email],
        subject: "Your OTP Code",
        html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
      });
  
      if (error) {
        return { success: false, message: "Failed to send OTP", error };
      }
  
      return { success: true, message: "OTP sent successfully" };
    } catch (err) {
      console.error("sendOtpMail error:", err);
      return { success: false, message: "Internal server error", error: err };
    }
  }