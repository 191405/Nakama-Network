/**
 * Systematic Error Handling Concept
 * 
 * This utility provides a standardized way to execute async operations
 * (like Firebase calls) and handle errors gracefully.
 */

// Error Categories
export const ErrorType = {
    NETWORK: 'NETWORK',
    PERMISSION: 'PERMISSION',
    VALIDATION: 'VALIDATION',
    UNKNOWN: 'UNKNOWN'
};

/**
 * Standardized Error Object
 */
class AppError extends Error {
    constructor(type, message, originalError = null) {
        super(message);
        this.type = type;
        this.originalError = originalError;
    }
}

/**
 * Wraps an async operation with standardized error handling and logging.
 * @param {Function} operation - The async function to execute
 * @param {string} contextName - Name of the operation for logging (e.g. "FetchUserProfile")
 * @returns {Promise<{success: boolean, data: any, error: AppError}>}
 */
export const safeExecute = async (operation, contextName = 'Operation') => {
    try {
        const result = await operation();
        return { success: true, data: result, error: null };
    } catch (error) {
        let appError;

        // Classify Error
        if (error.code === 'permission-denied' || (error.message && error.message.includes('insufficient permissions'))) {
            appError = new AppError(ErrorType.PERMISSION, `Permission denied in ${contextName}. Please check your login status.`, error);
        } else if (error.code === 'unavailable' || error.message.includes('network')) {
            appError = new AppError(ErrorType.NETWORK, `Network error in ${contextName}. Please check your connection.`, error);
        } else {
            appError = new AppError(ErrorType.UNKNOWN, `Unexpected error in ${contextName}: ${error.message}`, error);
        }

        // Systematic Logging (Console for now, could be Sentry/Crashlytics)
        console.error(`[ErrorManager] ${contextName} Failed:`, {
            type: appError.type,
            message: appError.message,
            original: error
        });

        return { success: false, data: null, error: appError };
    }
};

/**
 * Log error to external service (Placeholder)
 */
export const logError = (error, context) => {
    // console.log("Sending to Crashlytics...", error, context);
};
