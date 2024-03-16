import {
  convertDateTimeTo0AM,
  convertDayNumberToMillisecond,
} from "./utils/dateTimeParse.js";

const orders = [
  {
    orderTime: 1714867208888,
    estimateHandOffTime: 1723507208888,
    beginningOfTheDay: 1714842000000,
  },
  {
    orderTime: 1714867209999,
    estimateHandOffTime: 1715126409999,
    beginningOfTheDay: 1714842000000,
  },
  {
    orderTime: 1714867209999,
    estimateHandOffTime: 1715299209999,
    beginningOfTheDay: 1714842000000,
  },
  {
    orderTime: 1714867209999,
    estimateHandOffTime: 1714953609999,
    beginningOfTheDay: 1714842000000,
  },
  {
    orderTime: 1714867209999,
    estimateHandOffTime: 1715212809999,
    beginningOfTheDay: 1714842000000,
  },
  {
    orderTime: 1714867209999,
    estimateHandOffTime: 1715212809999,
    beginningOfTheDay: 1714842000000,
  },
  {
    orderTime: 1714867209999,
    estimateHandOffTime: 1715212809999,
    beginningOfTheDay: 1714842000000,
  },
  {
    orderTime: 1717113609999,
    estimateHandOffTime: 1717286409999,
    beginningOfTheDay: 1717088400000,
  },
  {
    orderTime: 1717113609999,
    estimateHandOffTime: 1717286409999,
    beginningOfTheDay: 1717088400000,
  },
  {
    orderTime: 1717027209999,
    estimateHandOffTime: 1717200009999,
    beginningOfTheDay: 1717002000000,
  },
];

const dateSlot = [
  {
    _id:"65df5dd37a592fb6b6466ad8",
    defaultSlot: 10,
    date: 1714842000000,
    maximumSlot: 12,
  },
  {
    _id:"65df5dd37a592fb6b6466ad8",
    defaultSlot: 10,
    date: 1715187600000,
    maximumSlot: 15,
  },
];

function getDaysOfMonth(year, month) {
  const days = [];
  const startDate = new Date(year, month - 1, 1); // Month is 0-based index in JavaScript Date ordersect
  const endDate = new Date(year, month, 0); // Get the last day of the month

  for (
    let date = startDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    // Set hours, minutes, seconds, and milliseconds to get 00:00:00
    date.setHours(0, 0, 0, 0);
    days.push(date.getTime()); // Get the timestamp for the date
  }

  return days;
}

// Example usage
const year = 2024;
const month = 5; // February (1-based index)

const daysOfMonth = getDaysOfMonth(2024, month);
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

const performanceStart = new Date().getTime();
orders.forEach((day, index) => {
  let mockDate = day.orderTime;
  while (mockDate < day.estimateHandOffTime) {
    const beginningTime = convertDateTimeTo0AM(mockDate);

    if (beginningTime > daysOfMonth[daysOfMonth.length - 1]) {
      break;
    }

    console.log("Success");

    ordersDate[beginningTime.toString()].actualSlot += 1;

    if(ordersSlot[beginningTime.toString()]) {
        ordersDate[beginningTime.toString()].maximumSlot = ordersSlot[beginningTime.toString()];
    }

    mockDate += convertDayNumberToMillisecond(1);
  }
});

const performanceEnd = new Date().getTime();

console.log(ordersDate);
console.log(daysOfMonth);
console.log(ordersSlot);
console.log("Perfomance: " + (performanceEnd - performanceStart));
