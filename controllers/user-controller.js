const { validationResult } = require("express-validator");

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

  //...hash password?

  const createdUser = new User({
    firstName,
    lastName,
    about,
    email,
    encry_password: password,
    salt: "",
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
exports.registerUser = registerUser;

//Login User
const loginUser = (req, res, next) => {};
exports.loginUser = loginUser;
