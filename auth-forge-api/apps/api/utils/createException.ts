export function createException(name: string, message: string, statusCode = 500) {
    const error = new Error(message);
    error.name = name;
    // @ts-ignore
    error.statusCode = statusCode;
    return error;
}
