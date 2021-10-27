const express = require("express");
const customers = require("./customers");
const rooms = require("./rooms");
const room_booking = require("./room_booking");
const joi = require("joi");
require("dotenv").config();

const app = express();

app.use(express.json());

app.listen(process.env.PORT || 3001, () =>
  console.log("Server is running at 3001")
);

//Create a new room endpoint
app.post("/rooms", (req, res) => {
  const schema = joi.object({
    name: joi.string().required(),
    amenities: joi.array(),                                                                                                                                                                                                                         
    location: joi.string().required(),
    oneHourPrice: joi.number().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.send(error.details[0].message);

  // Check if hall already Exists

  let isPresent = rooms.find((room) => room.name == req.body.name);
  if (isPresent)
    return res
      .status(422)
      .json({ message: "Hall with the same name already Exists" });

  // Add the new entry in rooms

  const newRoom = {
    id: rooms.length + 1,
    name: req.body.name,
    amenities: req.body.amenities,
    location: req.body.location,
    oneHourPrice: req.body.oneHourPrice,
  };

  rooms.push(newRoom);
  return res
    .status(201)
    .json({ message: "Data added successfully", data: newRoom });
});

// Book room for customer

app.post("/bookroom", (req, res) => {
  const schema = joi.object({
    custid: joi.number().required(),
    roomid: joi.number().required(),
    startDate: joi.date().required(),
    endDate: joi.date().required(),
  });

  const { error } = schema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ message: "Bad request", data: error.details[0].message });

  // Check if the room is booked already in the same time range.

  const bookingExists = room_booking.find(
    (booking) =>
      ((req.body.startDate <= booking.startDate &&
        req.body.endDate >= booking.startDate &&
        req.body.endDate <= booking.endDate) ||
        (req.body.endDate >= booking.startDate &&
          req.body.endDate <= booking.endDate)) &&
      booking.roomid == req.body.roomid
  );

  if (bookingExists)
    return res.status(422).json({
      message: "There is already a booking available in the same time range",
      data: bookingExists,
    });

  let newBooking = {
    id: room_booking.length + 1,
    custid: req.body.custid,
    roomid: req.body.roomid,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  };

  room_booking.push(newBooking);
  console.log(room_booking);
  return res.status(201).json({ message: "Booking done successfully" });
});

app.get("/roomsbookingstatus", (req, res) => {
  let result = [];
  let bookingViewModel;
  room_booking.forEach((booking) => {
    bookingViewModel = {
      customerName: customers.find((x) => x.id == booking.custid).name,
      roomName: rooms.find((x) => x.id == booking.roomid).name,
      startDate: booking.startDate,
      endDate: booking.endDate,
    };
    result.push(bookingViewModel);
  });

  res.send(result);
});

app.get("/", (req, res) => {
  res.send("Express-server");
});
