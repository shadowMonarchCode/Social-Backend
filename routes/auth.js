// * Imports
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { register, login, signout } = require("../controllers/auth");

// * Routes
router.post(
  "/register",
  [check("firstName", "First name should be atleast 3 characters!").isLength({ min: 3 })],
  [check("lastName", "Last name should be atleast 3 characters!").isLength({ min: 3 })],
  [check("email", "Valid email is required!").isEmail()],
  [
    check("password", "Password should be atleast 3 characters!").isLength({
      min: 6,
    }),
  ], // TODO: We can do more validations here
  register
);

router.post(
  "/login",
  [check("email", "Valid email is required!").isEmail()],
  [
    check("password", "Password should be of atleast 6 characters!").isLength({
      min: 6,
    }),
  ], // TODO: We can do more validations here
  login
);

router.get("/signout", signout);

// * Export
module.exports = router;
