export default (data, statusCode, message) => {
    const respMessage = statusCode >= 200 && !message ? 'Success' : 'Failed';

    return {
        statusCode: statusCode,
        message: respMessage,
        data: data
    }
}