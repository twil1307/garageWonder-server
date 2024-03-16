import { BOOKING_ESTIMATE_TYPE, CANT_ESTIMATE_DURATION } from "../enum/booking.enum.js";
import { convertDayNumberToMillisecond } from "../utils/dateTimeParse.js";

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
