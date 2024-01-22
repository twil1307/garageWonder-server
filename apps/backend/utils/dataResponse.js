export default (data, statusCode, message) => {
    const respMessage = statusCode >= 200 && message ? message : 'Failed';

    return {
        statusCode: statusCode,
        message: respMessage,
        data: data
    }
}