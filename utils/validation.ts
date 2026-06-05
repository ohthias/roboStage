/**
 * Validation utilities for database operations
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates that a string is not empty and has reasonable length
 */
export function validateNonEmptyString(
  value: unknown,
  fieldName: string,
  maxLength: number = 1000
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName} exceeds maximum length of ${maxLength}`);
  }

  return trimmed;
}

/**
 * Validates that a value is a valid UUID
 */
export function validateUUID(value: unknown, fieldName: string = "ID"): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`);
  }

  return value;
}

/**
 * Validates that a value is a positive integer
 */
export function validatePositiveInteger(
  value: unknown,
  fieldName: string = "ID",
  min: number = 1
): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }

  if (value < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }

  return value;
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(
  limit?: unknown,
  offset?: unknown,
  maxLimit: number = 100
): { limit: number; offset: number } {
  let validLimit = 10;
  let validOffset = 0;

  if (limit !== undefined) {
    validLimit = validatePositiveInteger(limit, "limit", 1);
    if (validLimit > maxLimit) {
      validLimit = maxLimit;
    }
  }

  if (offset !== undefined) {
    validOffset = validatePositiveInteger(offset, "offset", 0);
  }

  return { limit: validLimit, offset: validOffset };
}

/**
 * Validates email format
 */
export function validateEmail(value: unknown, fieldName: string = "email"): string {
  const str = validateNonEmptyString(value, fieldName, 255);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) {
    throw new ValidationError(`${fieldName} must be a valid email address`);
  }

  return str.toLowerCase();
}

/**
 * Validates password strength
 */
export function validatePassword(value: unknown, fieldName: string = "password"): string {
  const str = validateNonEmptyString(value, fieldName, 128);

  if (str.length < 8) {
    throw new ValidationError(`${fieldName} must be at least 8 characters long`);
  }

  return str;
}

/**
 * Validates that a value is one of the allowed options
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): T {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`
    );
  }

  return value as T;
}
