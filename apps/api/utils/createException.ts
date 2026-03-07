export interface AppException extends Error {
  statusCode: number;
  code?: string;
}

export function createException(
  name: string,
  message: string,
  statusCode = 500,
  code?: string,
): AppException {
  const error = new Error(message) as AppException;
  error.name = name;
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}
