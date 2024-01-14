const Room = require("../models/Room");
const Booking = require("../models/Booking");
const BookingDetail = require("../models/BookingDetail");

const getUnavailableDateRanges = async (hotelId) => {
  const rooms = await Room.find({ hotelId }).select("_id").lean();

  const roomIds = rooms.map((room) => room._id.toString());

  const yesterday = new Date();
  const month = yesterday.getMonth() + 1;
  yesterday.setDate(yesterday.getDate() - 1);

  // need to optimize here
  const bookings = await BookingDetail.find({
    $and: [
      {
        // filter booking where checkin is this month
        $expr: { $eq: [{ $month: "$checkin" }, month] },
      },
      {
        hotelId: hotelId,
      },
    ],
  });

  console.log(yesterday);
  console.log(bookings);

  if (bookings.length == 0) {
    return [];
  }

  const roomBookings = roomIds.reduce((arr, key) => {
    arr[key] = [];
    return arr;
  }, {});

  bookings.forEach((booking) => {
    const { roomId, checkin, checkout } = booking;

    // Add the booking dates to the array
    const currentDate = new Date(checkin);
    while (currentDate <= checkout) {
      // format: 8/25/2023, 12:00:00 AM
      roomBookings[roomId].push(currentDate.toLocaleString().split(",")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  const bookingOrders = Object.values(roomBookings);

  // Find the common values using reduce and filter
  // This is all the date booked from the past to now
  const bookedDate = bookingOrders.reduce((common, arr) => {
    return common.filter((value) => arr.includes(value));
  });

  console.log(bookedDate);

  const bookedDatefiltered = filterDates(bookedDate);

  return bookedDatefiltered;
};

const getUnavailableDateRangesWithRoomType = async (hotelId, roomTypeId) => {
  const rooms = await Room.find({ hotelId: hotelId, roomTypeId: roomTypeId })
    .select("_id")
    .lean();

  const roomIds = rooms.map((room) => room._id.toString());

  const yesterday = new Date();
  const month = yesterday.getMonth() + 1;
  yesterday.setDate(yesterday.getDate() - 1);

  // need to optimize here
  const bookings = await BookingDetail.find({
    $and: [
      {
        // filter booking where checkin is this month
        $expr: { $eq: [{ $month: "$checkin" }, month] },
      },
      {
        hotelId: hotelId,
      },
    ],
  });

  if (bookings.length == 0) {
    return [];
  }

  const roomBookings = roomIds.reduce((arr, key) => {
    arr[key] = [];
    return arr;
  }, {});

  bookings.forEach((booking) => {
    const { roomId, checkin, checkout } = booking;

    // Add the booking dates to the array
    const currentDate = new Date(checkin);
    while (currentDate <= checkout) {
      // format: 8/25/2023, 12:00:00 AM
      roomBookings[roomId].push(currentDate.toLocaleString().split(",")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  const bookingOrders = Object.values(roomBookings);

  // Find the common values using reduce and filter
  // This is all the date booked from the past to now
  const bookedDate = bookingOrders.reduce((common, arr) => {
    return common.filter((value) => arr.includes(value));
  });

  const bookedDatefiltered = filterDates(bookedDate);

  return bookedDatefiltered;
};

const groupRoomIdBy = (data) => {
  const groupedData = data.reduce((result, item) => {
    const { roomTypeId, _id } = item; // Destructure roomTypeId and the rest of the object
    if (!result[roomTypeId]) {
      result[roomTypeId] = []; // Initialize an array for each unique roomTypeId
    }
    result[roomTypeId].push(_id); // Push the object without roomTypeId
    return result;
  }, {});

  return groupedData;
};

const filterDates = (dateArray) => {
  const today = new Date(); // Current date

  // if keep current date, then the comparison below of "=" will
  // not be happened due to the minute of current date
  today.setHours(0, 0, 0, 0);
  const filteredDates = dateArray.filter((dateString) => {
    const parts = dateString.split("/"); // Split the date string into parts
    const date = new Date(parts[2], parts[0] - 1, parts[1]); // Create a Date object

    console.log(date);

    return date >= today;
  });

  return filteredDates;
};

// basically get all the room booked in the date range checkin and checkout given
const bookingDateDuplicateCheck = async (
  checkin,
  checkout,
  hotelId,
  roomType
) => {
  const bookingCheck = await BookingDetail.distinct("roomId", {
    $and: [
      {
        $or: [
          {
            $and: [
              { checkin: { $lte: checkin } },
              { checkout: { $gte: checkout } },
            ],
          },
          {
            $and: [
              { checkin: { $lte: checkin } },
              {
                checkout: {
                  $lt: checkout,
                  $gt: checkin,
                },
              },
            ],
          },
          {
            $and: [
              {
                checkin: {
                  $lt: checkout,
                  $gt: checkin,
                },
              },
              { checkout: { $gte: checkout } },
            ],
          },
          {
            $and: [
              { checkin: { $gt: checkin } },
              { checkout: { $lt: checkout } },
            ],
          },
        ],
      },
      {
        roomType: roomType,
      },
      {
        hotelId: hotelId,
      },
    ],
  });

  return bookingCheck;
};

// Compare 2 array
// Check if rooms id is equal to the rooms of overlap day, if equals => all the rooms in the date range are booked
// else => get out all the not booked room and set the first room to guest
const compareRoomFilterId = (hotelRoomIds, bookingCheck) => {
  const roomAvailable = hotelRoomIds.filter((element) =>
    bookingCheck.every((item) => item.toString() !== element.toString())
  );
  return roomAvailable;
};

module.exports = {
  getUnavailableDateRanges,
  groupRoomIdBy,
  getUnavailableDateRangesWithRoomType,
  bookingDateDuplicateCheck,
  compareRoomFilterId,
};
