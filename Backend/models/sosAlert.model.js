const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Captain",
    },
    triggeredBy: {
      type: String,
      enum: ["user", "captain"],
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "Emergency assistance requested",
    },
    location: {
      ltd: Number,
      lng: Number,
    },
    status: {
      type: String,
      enum: ["open", "acknowledged", "resolved"],
      default: "open",
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SosAlert", sosAlertSchema);
