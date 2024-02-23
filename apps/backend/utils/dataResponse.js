export default (data, statusCode = 200, message = 'Success', cursor, nextCursor, limit, total) => {
    return {
        statusCode: statusCode,
        message: message,
        data: data,
        cursor: cursor || undefined,
        nextCursor: nextCursor || undefined,
        limit: limit || undefined,
        total: total || undefined
    }
}