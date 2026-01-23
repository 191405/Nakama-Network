/**
 * Sanitizes user profile data to ensure it meets Firestore security rules
 * @param {Object} data - The user profile data object
 * @returns {Object} Sanitized data object
 */
export const sanitizeUserProfile = (data) => {
    if (!data) return {};

    const sanitized = { ...data };

    // 1. Sanitize displayName
    // Rule: validDisplayName() requires string, size >= 2 && size <= 30
    if (sanitized.displayName) {
        if (typeof sanitized.displayName !== 'string') {
            sanitized.displayName = String(sanitized.displayName);
        }

        let name = sanitized.displayName.trim();

        // Ensure minimum length of 2
        if (name.length < 2) {
            name = name + "_User";
        }

        // Ensure maximum length of 30
        if (name.length > 30) {
            name = name.substring(0, 30);
        }

        sanitized.displayName = name;
    }

    // 2. Remove undefined values (Firestore rejects undefined)
    // This fixes: "Unsupported field value: undefined"
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === undefined) {
            delete sanitized[key];
        }
    });

    // 3. Ensure email is null instead of undefined if missing
    if (!sanitized.email) {
        sanitized.email = null;
    }

    return sanitized;
};
