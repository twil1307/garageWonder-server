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
    try {
        const now = new Date();
        const tomorrow = new Date(Number.parseInt(dateTime));
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(3, 0, 0, 0);

        const delayInMils = (tomorrow.getTime() - now.getTime())/1000;

        // const delaySec = delayInMils / 1000;

        return Math.floor(delayInMils);
        // return 10000;
    } catch (error) {
        console.log("error at get3AmAfterBookingDayFromToday")
    }
    
}