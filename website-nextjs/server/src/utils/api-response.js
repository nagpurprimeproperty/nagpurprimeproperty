export const successResponse = (data, message = 'Success', pagination, ...rest) => ({ success: true, message, data, pagination, ...rest });
