const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

//Register User
const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed, please try again.", 403));
  }

  const { firstName, lastName, about, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "User registeration failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User already exists, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 13);
  } catch (err) {
    return next(new HttpError("Can't create a new user", 500));
  }

  const createdUser = new User({
    firstName,
    lastName,
    about,
    email,
    password:hashedPassword,
    // salt: "",
    posts: [],
    todo: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "User registeration failed, please try again later.",
      500
    );
    return next(error);
  }

  //Genreate JWT here
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "User registeration failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

//Login User
const loginUser = async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed, please try again.", 403));
  }

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Couldn't login, please try again later.", 500));
  }

  if (!existingUser) {
    return next(
      new HttpError(
        "Couldn't identify the user, credentials seems to be wrong!!",
        401
      )
    );
  }

  let passwordIsValid = false;
  try {
    passwordIsValid = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("Couldn't login, please try again later.", 500));
  }

  if (!passwordIsValid) {
    return next(
      new HttpError(
        "Couldn't identify the user, credentials seems to be wrong!!",
        401
      )
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Logging in user failed!!", 500));
  }

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.registerUser = registerUser;
exports.loginUser = loginUser;
