import { BOOKING_ESTIMATE_TYPE, CANT_ESTIMATE_DURATION } from "../enum/booking.enum.js";
import { convertDateTimeTo0AM, convertDayNumberToMillisecond, getDaysOfMonth, millisecondsUntilNextDay } from "../utils/dateTimeParse.js";

export const estimateHandOffTime = (estimationType, orderTime, estimationDuration) => {
  let timeResult = 0;

  console.log(orderTime);

  switch (estimationType) {
    case BOOKING_ESTIMATE_TYPE.SAME_DAY:
      timeResult = orderTime;
      break;
    case BOOKING_ESTIMATE_TYPE.EXACT_DAY:
    case BOOKING_ESTIMATE_TYPE.COMPLETE_IN_RANGE:
      timeResult =
        orderTime +
        convertDayNumberToMillisecond(estimationDuration);
      break;

    default:
      timeResult = orderTime + CANT_ESTIMATE_DURATION;
      break;
  }

  console.log(timeResult);

  return timeResult;
};

export const getScheduleSlotByMonth = (startDate, orders, dateSlot) => {
  const scheduleDate = new Date(startDate);
  
  const daysOfMonth = getDaysOfMonth(scheduleDate.getFullYear(), scheduleDate.getMonth() + 1);
  
  const defaultDateSlot = dateSlot[0].defaultSlot;
  
  const ordersDate = {};
  const ordersSlot = {};

  daysOfMonth.forEach((day) => {
    ordersDate[day] = {
      actualSlot: 0,
      maximumSlot: ordersSlot[day.toString()] || defaultDateSlot
    };
  });
  
  dateSlot.forEach((date) => {
      ordersSlot[date.date] = date.maximumSlot;
  })

  console.log(ordersDate);
  console.log(ordersSlot);

  orders.forEach((day) => {
    let mockDate = day.orderTime;
    while (mockDate < day.estimateHandOffTime) {
      const beginningTime = convertDateTimeTo0AM(mockDate);
      console.log(new Date(mockDate))
      console.log(new Date(beginningTime));
      console.log("=================")
  
      if (beginningTime > daysOfMonth[daysOfMonth.length - 1]) {
        break;
      }
  
      ordersDate[beginningTime.toString()].actualSlot += 1;
  
      if(ordersSlot[beginningTime.toString()]) {
          ordersDate[beginningTime.toString()].maximumSlot = ordersSlot[beginningTime.toString()];
      }
  
      mockDate += millisecondsUntilNextDay(mockDate);
    }
  });

  return ordersDate;
}
