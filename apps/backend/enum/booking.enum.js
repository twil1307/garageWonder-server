import { convertDayNumberToMillisecond } from "../utils/dateTimeParse.js";

export const BOOKING_ESTIMATE_TYPE = {
    SAME_DAY: 0,
    EXACT_DAY: 1,
    COMPLETE_IN_RANGE: 2,
    CANT_ESTIMATE: 3
};

export const CANT_ESTIMATE_DURATION = convertDayNumberToMillisecond(100);

// booking status
export const ERROR_OCCURRED = -1;
export const EVALUATE = 0;
export const PREPARE = 1;
export const FIXING = 2;
export const COMPLETE = 3