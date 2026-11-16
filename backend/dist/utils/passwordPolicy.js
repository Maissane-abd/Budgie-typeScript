export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_POLICY_MESSAGE = 'Utilisez au moins 12 caract\u00e8res, une majuscule, un chiffre et un caract\u00e8re sp\u00e9cial .';
// Checks if a password meets the defined policy
export function isValidPassword(value) {
    return (typeof value === 'string' &&
        Array.from(value).length >= PASSWORD_MIN_LENGTH &&
        new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES &&
        /\p{Lu}/u.test(value) &&
        /[0-9]/.test(value) &&
        /[^\p{L}\p{N}\s]/u.test(value));
}
