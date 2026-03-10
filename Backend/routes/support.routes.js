const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");
const supportController = require("../controllers/support.controller");

const router = express.Router();

router.post(
  "/tickets",
  authMiddleware.authUser,
  body("subject")
    .isString()
    .isLength({ min: 3, max: 120 })
    .withMessage("Subject should be between 3 and 120 characters"),
  body("message")
    .isString()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Message should be between 5 and 1000 characters"),
  body("rideId").optional().isMongoId().withMessage("Invalid ride id"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  supportController.createTicket
);

router.get("/tickets", authMiddleware.authUser, supportController.listTickets);

module.exports = router;
