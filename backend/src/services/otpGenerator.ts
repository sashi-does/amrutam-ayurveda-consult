import crypto from "crypto"

export function generateOTP(length = 6) {
    return crypto.randomInt(0, Math.pow(10, length))
        .toString()
        .padStart(length, "0");
}