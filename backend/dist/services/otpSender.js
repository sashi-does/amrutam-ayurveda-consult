"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpMail = sendOtpMail;
const resend_1 = require("resend");
const AMRUTAM_MAIL_KEY = process.env.AMRUTAM_MAIL_KEY;
const resend = new resend_1.Resend(AMRUTAM_MAIL_KEY);
async function sendOtpMail(email, otp) {
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
    }
    catch (err) {
        console.error("sendOtpMail error:", err);
        return { success: false, message: "Internal server error", error: err };
    }
}
//# sourceMappingURL=otpSender.js.map