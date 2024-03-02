export const getBeginningOfTheDay = (dateTime) => {
    const date = new Date(dateTime);

    date.setHours(0, 0, 0, 0);

    return date.getTime();
}

export const getWholeDayInMlSec = (dateTime) => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000 - 1;
    
    return dateTime + oneDayInMilliseconds;
}

export const hourToSecond = (hour) => {
    return hour * 60 * 60;
}

export const get3AmNextDayInMls = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(3, 0, 0, 0);

    // const delayInMils = tomorrow.getTime() - now.getTime();

    // testing purpose
    const delayInMils = now.getTime() + 15000 - now.getTime();

    return delayInMils;
}

export const get3AmNextDayInMlsWithDate = (dateTime) => {
    const dateTimeFormat = new Date(dateTime);
    const nextDayFromDateTime = new Date(dateTimeFormat);
    nextDayFromDateTime.setDate(dateTimeFormat.getDate() + 1);
    nextDayFromDateTime.setHours(3, 0, 0, 0);

    // const delayInMils = nextDayFromDateTime.getTime() - dateTime;

    // testing purpose
    const delayInMils = now.getTime() + 15000 - now.getTime();

    return delayInMils;
}

export const get3AmAfterBookingDayFromToday = (dateTime) => {
    const now = new Date();
    const orderDate = new Date(dateTime);
    const tomorrow = new Date(orderDate);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(3, 0, 0, 0);

    const delayInMils = tomorrow.getTime() - now.getTime();

    // return delayInMils;
    return 10000;
}