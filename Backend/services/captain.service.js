const captainModel = require("../models/captain.model");

module.exports.createCaptain = async (
  firstname,
  lastname,
  email,
  password,
  phone,
  drivingLicenseNumber,
  model,
  color,
  number,
  capacity,
  type
) => {
  if (!firstname || !email || !password || !phone || !drivingLicenseNumber || !model || !color || !number || !capacity || !type) {
    throw new Error("All fields are required");
  }

  const hashedPassword = await captainModel.hashPassword(password);

  const captain = await captainModel.create({
    fullname: {
      firstname,
      lastname,
    },
    email,
    password: hashedPassword,
    phone,
    drivingLicenseNumber,
    vehicle: {
      model,
      color,
      number,
      capacity,
      type,
    },
    // Required by schema; updated later by live location events after login.
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  });

  return captain;
};
