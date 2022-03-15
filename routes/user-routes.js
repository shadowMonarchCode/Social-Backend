const express = require("express");
const { check } = require("express-validator");

const userController = require("../controllers/user-controller");

const router = express.Router();

router.post(
  "/register",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@Test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userController.registerUser
);

router.post(
  "/login",
  [check("email").normalizeEmail()],
  userController.loginUser
);

module.exports = router;
