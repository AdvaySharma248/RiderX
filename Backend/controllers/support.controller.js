const { validationResult } = require("express-validator");
const rideModel = require("../models/ride.model");
const supportTicketModel = require("../models/supportTicket.model");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

module.exports.createTicket = async (req, res) => {
  if (!handleValidation(req, res)) {
    return;
  }

  const { subject, message, rideId, priority } = req.body;

  try {
    let rideRef;
    if (rideId) {
      const ride = await rideModel.findOne({ _id: rideId, user: req.user._id });
      if (!ride) {
        return res.status(404).json({
          message: "Ride not found for ticket mapping",
          code: "SUPPORT_RIDE_NOT_FOUND",
        });
      }
      rideRef = ride._id;
    }

    const ticket = await supportTicketModel.create({
      user: req.user._id,
      ride: rideRef,
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || "medium",
      createdBy: "user",
    });

    return res.status(201).json({
      message: "Support ticket created",
      ticket: {
        _id: ticket._id,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to create support ticket",
      code: "SUPPORT_TICKET_CREATE_FAILED",
    });
  }
};

module.exports.listTickets = async (req, res) => {
  try {
    const tickets = await supportTicketModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("ride", "pickup destination status");

    return res.status(200).json({
      tickets: tickets.map((ticket) => ({
        _id: ticket._id,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        ride: ticket.ride
          ? {
              _id: ticket.ride._id,
              pickup: ticket.ride.pickup,
              destination: ticket.ride.destination,
              status: ticket.ride.status,
            }
          : null,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to fetch support tickets",
      code: "SUPPORT_TICKETS_FETCH_FAILED",
    });
  }
};
