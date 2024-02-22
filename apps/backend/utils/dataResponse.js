export default (data, statusCode = 200, message = 'Success', nextCursor) => {
    return {
        statusCode: statusCode,
        message: message,
        data: data,
        nextCursor: nextCursor || undefined
    }
}