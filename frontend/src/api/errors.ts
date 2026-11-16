
import { ApiError } from './client';

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: ApiFieldError[] | null;
}

export type FormErrors = Record<string, string>;

export function mapFieldErrors(
  apiError: ApiErrorResponse
): FormErrors {
  const errors: FormErrors = {};

  for (const fieldError of apiError.fieldErrors ?? []) {
    errors[fieldError.field] = fieldError.message;
  }

  return errors;
}

export function isApiErrorResponse(
  value: unknown
): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ApiErrorResponse>;

  return (
    typeof candidate.status === 'number' &&
    typeof candidate.message === 'string' &&
    (
      candidate.fieldErrors === null ||
      (
        Array.isArray(candidate.fieldErrors) &&
        candidate.fieldErrors.every(
          (item) =>
            typeof item?.field === 'string' &&
            typeof item?.message === 'string'
        )
      )
    )
  );
}

export function getApiFieldErrors(
  error: unknown
): FormErrors {
  if (
    error instanceof ApiError &&
    isApiErrorResponse(error.body)
  ) {
    return mapFieldErrors(error.body);
  }

  return {};
}
