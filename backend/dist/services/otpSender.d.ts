export declare function sendOtpMail(email: string, otp: string): Promise<{
    success: boolean;
    message: string;
    error?: never;
} | {
    success: boolean;
    message: string;
    error: unknown;
}>;
//# sourceMappingURL=otpSender.d.ts.map