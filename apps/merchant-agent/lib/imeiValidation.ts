/**
 * Utility functions for IMEI validation and processing
 */

/**
 * Validates IMEI using Luhn algorithm
 * An IMEI is valid if it is 15 digits long and passes the Luhn check
 */
export function validateIMEIComplete(imei: string): boolean {
    if (!/^\d{15}$/.test(imei)) {
        return false;
    }
    return luhnCheck(imei);
}

/**
 * Parses IMEI from barcode or QR code data
 * Supports various formats found on device boxes
 */
export function parseIMEIFromBarcode(data: string): string | null {
    // Try to find a 15-digit number
    const match = data.match(/\b\d{15}\b/);
    if (match) {
        return match[0];
    }

    // Try matching typical IMEI prefixes
    const prefixMatch = data.match(/IMEI:?\s*(\d{15})/i);
    if (prefixMatch) {
        return prefixMatch[1];
    }

    return null;
}

/**
 * Formats IMEI for display (e.g., 12 345678 901234 5)
 */
export function formatIMEI(imei: string): string {
    const cleaned = imei.replace(/\D/g, '');
    if (cleaned.length !== 15) return imei;

    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 8)} ${cleaned.slice(8, 14)} ${cleaned.slice(14)}`;
}

/**
 * Helper: Luhn Algorithm Check
 */
function luhnCheck(value: string): boolean {
    let sum = 0;
    let isSecond = false;

    for (let i = value.length - 1; i >= 0; i--) {
        let d = parseInt(value.charAt(i), 10);

        if (isSecond) {
            d = d * 2;
            if (d > 9) {
                d -= 9;
            }
        }

        sum += d;
        isSecond = !isSecond;
    }

    return (sum % 10) === 0;
}
