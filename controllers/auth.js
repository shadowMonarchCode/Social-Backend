const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.register = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: {
        location: errors.array()[0].location,
        msg: errors.array()[0].msg,
        param: errors.array()[0].param,
      },
    });
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
        console.log(err);
      return res.status(400).json({
        err: "NOT ABLE TO SAVE USER IN DB",
      });
    }
    res.json({
      id: user._id,
      name: user.firstName,
      email: user.email,
    });
  });
};

exports.login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // ! Error Handling
    return res.status(422).json({
      error: {
        location: errors.array()[0].location,
        msg: errors.array()[0].msg,
        param: errors.array()[0].param,
      },
    });
  }

  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        message: "User doesn't exist",
      });
    }
    if (!user.authenticate(password)) {
      return res.status(400).json({
        message: "Email and password do not match",
      });
    }

    // * Create a token
    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.SECRET
    );

    // * Put tokken in a cookie
    res.cookie("token", token, {
      expire: new Date() + 9999,
    });

    // * Send token to front end
    const { _id, firstName, email } = user;
    return res.json({
      token,
      user: {
        _id,
        firstName,
        email
      },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signed out.",
  });
};

//* Protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

//* Custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};
