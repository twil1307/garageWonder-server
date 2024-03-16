export const TIMEZONE_OFF_SET_GMT7 = 7 * 60 * 60 * 1000;

export const getBeginningOfTheDay = (dateTime) => {
  const date = new Date(dateTime);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(date.getDate()).padStart(2, "0");

  const formattedDate = `${year}/${month}/${day}`;

  return formattedDate;

  // date.setHours(0, 0, 0, 0);

  // return date.getTime();
};

export const convertDateTimeTo0AM = (dateTimeNumber) => {
  const timezoneOffset = TIMEZONE_OFF_SET_GMT7; // Adjusting for GMT+7 timezone offset
  const dayMilliseconds = 24 * 60 * 60 * 1000; // Milliseconds in a day

  // Ensure the original timestamp represents the start of the day in the specified timezone
  const adjustedTime = Math.floor((dateTimeNumber + timezoneOffset) / dayMilliseconds) * dayMilliseconds - timezoneOffset;

  return adjustedTime;
};

export const getWholeDayInMlSec = (dateTime) => {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000 - 1;

  return dateTime + oneDayInMilliseconds;
};

export const hourToSecond = (hour) => {
  return hour * 60 * 60;
};

export const get3AmNextDayInMls = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(3, 0, 0, 0);

  // const delayInMils = tomorrow.getTime() - now.getTime();

  // testing purpose
  const delayInMils = now.getTime() + 15000 - now.getTime();

  return delayInMils;
};

export const get3AmNextDayInMlsWithDate = (dateTime) => {
  const dateTimeFormat = new Date(dateTime);
  const nextDayFromDateTime = new Date(dateTimeFormat);
  nextDayFromDateTime.setDate(dateTimeFormat.getDate() + 1);
  nextDayFromDateTime.setHours(3, 0, 0, 0);

  // const delayInMils = nextDayFromDateTime.getTime() - dateTime;

  // testing purpose
  const delayInMils = now.getTime() + 15000 - now.getTime();

  return delayInMils;
};

export const get3AmAfterBookingDayFromToday = (dateTime) => {
  try {
    const now = new Date();
    const tomorrow = new Date(Number.parseInt(dateTime));
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3, 0, 0, 0);

    const delayInMils = (tomorrow.getTime() - now.getTime()) / 1000;

    // const delaySec = delayInMils / 1000;

    return Math.floor(delayInMils);
    // return 10000;
  } catch (error) {
    console.log("error at get3AmAfterBookingDayFromToday");
  }
};

export const convertDayNumberToMillisecond = (hour) => {
  return hour * 24 * 60 * 60 * 1000;
};

export function millisecondsUntilNextDay(startTimestamp) {
  // Define constants
  const dayMilliseconds = 24 * 60 * 60 * 1000; // Milliseconds in a day
  const timezoneOffset = TIMEZONE_OFF_SET_GMT7; 

  // Adjust the given time to 0 AM (start of the day)
  const startOfDay = Math.floor((startTimestamp + timezoneOffset) / dayMilliseconds) * dayMilliseconds - timezoneOffset;

  // Calculate the timestamp for 0 AM of the next day by adding 24 hours' worth of milliseconds
  const nextDay = startOfDay + dayMilliseconds;

  // Calculate the difference in milliseconds between the given time and 0 AM of the next day
  const millisecondsUntilNextDay = nextDay - startTimestamp + 10;

  return millisecondsUntilNextDay;
}

export const getDaysOfMonth = (year, month) => {
  const days = [];
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  for (
    let date = startDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    date.setHours(0, 0, 0, 0);
    days.push(date.getTime()); // Get the timestamp for the date
  }

  return days;
}

export function isValidDateNumber(number) {
  // Check if the number is a positive integer
  if (!Number.isInteger(number) || number <= 0) {
    return false;
  }

  const date = new Date(number);

  return !isNaN(date.getTime());
}
