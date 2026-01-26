/**
 * Validates a Nigerian phone number.
 * Supports formats: 080..., +234..., 234...
 * Returns normalized format: 080...
 */
export function validatePhoneNumber(phone: string): { valid: boolean; normalized?: string } {
    // Remove spaces and non-numeric chars except +
    const cleaned = phone.replace(/[\s-]/g, '');

    // Regex patterns
    const formats = [
        { pattern: /^0(7|8|9)(0|1)\d{8}$/, type: 'local' }, // 08012345678
        { pattern: /^\+234(7|8|9)(0|1)\d{8}$/, type: 'intl' }, // +2348012345678
        { pattern: /^234(7|8|9)(0|1)\d{8}$/, type: 'intl_noc' }, // 2348012345678
    ];

    for (const format of formats) {
        if (format.pattern.test(cleaned)) {
            let normalized = cleaned;
            if (format.type === 'intl') {
                normalized = '0' + cleaned.substring(4);
            } else if (format.type === 'intl_noc') {
                normalized = '0' + cleaned.substring(3);
            }
            return { valid: true, normalized };
        }
    }

    return { valid: false };
}

/**
 * Validates full name (First Last)
 */
export function validateName(name: string): boolean {
    return name.trim().split(/\s+/).length >= 2 && name.length >= 5;
}

/**
 * Validates NIN (11 digits)
 */
export function validateNIN(nin: string): boolean {
    return /^\d{11}$/.test(nin);
}

/**
 * Validates BVN (11 digits)
 */
export function validateBVN(bvn: string): boolean {
    return /^\d{11}$/.test(bvn);
}

/**
 * Validates IMEI (15 digits)
 */
export function validateIMEI(imei: string): boolean {
    // Basic length check (Luhn algorithm could be added for strict validation)
    return /^\d{15}$/.test(imei);
}

/**
 * Formats a number as Nigerian Naira currency
 */
export function formatAmount(amount: number): string {
    return '₦' + amount.toLocaleString('en-NG');
}

/**
 * Formats a phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return phone;

    // Format as 080 1234 5678
    if (cleaned.startsWith('234')) {
        return `0${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)} ${cleaned.slice(10)}`;
    }
    if (cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
}

/**
 * Validates OTP (6 digits)
 */
export function validateOTP(otp: string): boolean {
    return /^\d{6}$/.test(otp);
}
