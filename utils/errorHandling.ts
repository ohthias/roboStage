/**
 * Error handling utilities for standardized API responses
 */

export interface ApiErrorResponse {
  error: string;
  code?: string;
  statusCode: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  statusCode: number;
}

/**
 * Standard error codes for different error types
 */
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  DATABASE_ERROR = "DATABASE_ERROR",
  TRANSACTION_ERROR = "TRANSACTION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: ErrorCode = ErrorCode.INTERNAL_ERROR
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Handles and normalizes Supabase errors
 */
export function handleDatabaseError(
  error: unknown,
  context: string = "database operation"
): ApiError {
  console.error(`Error during ${context}:`, error);

  if (error instanceof ApiError) {
    return error;
  }

  // Handle Supabase specific errors
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, any>;

    // Unique constraint violation
    if (err.code === "23505") {
      return new ApiError(
        "Record already exists",
        409,
        ErrorCode.DATABASE_ERROR
      );
    }

    // Foreign key violation
    if (err.code === "23503") {
      return new ApiError(
        "Invalid reference to related record",
        400,
        ErrorCode.DATABASE_ERROR
      );
    }

    // Not found
    if (err.code === "PGRST116") {
      return new ApiError(
        "Record not found",
        404,
        ErrorCode.NOT_FOUND
      );
    }

    if (err.message) {
      return new ApiError(
        `Database error: ${err.message}`,
        500,
        ErrorCode.DATABASE_ERROR
      );
    }
  }

  return new ApiError(
    `Failed to complete ${context}`,
    500,
    ErrorCode.INTERNAL_ERROR
  );
}

/**
 * Wraps async repository methods with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string = "operation"
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const apiError = handleDatabaseError(error, context);
    return { error: apiError };
  }
}

/**
 * Extracts the user ID from auth header for security checks
 */
export function extractUserIdFromAuth(
  authHeader?: string
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    // This is a placeholder - in actual implementation, you would verify the JWT
    // The real verification happens at the Supabase level via RLS
    return authHeader.slice(7);
  } catch {
    return null;
  }
}

/**
 * Validates that requester has access to resource
 */
export function validateOwnership(
  resourceOwnerId: string,
  requesterId: string | null,
  resourceType: string = "resource"
): void {
  if (!requesterId) {
    throw new ApiError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
  }

  if (resourceOwnerId !== requesterId) {
    throw new ApiError(
      `You do not have permission to modify this ${resourceType}`,
      403,
      ErrorCode.FORBIDDEN
    );
  }
}
