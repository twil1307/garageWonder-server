export default (data, statusCode = 200, message = 'Success') => {
    return {
        statusCode: statusCode,
        message: message,
        data: data
    }
}