//* Imports :-
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const todosRoutes = require("./routes/todos-routes");
const userRoutes = require("./routes/user-routes");

//* Constants :-
const app = express();
const port = process.env.PORT || 8000;

//* Database Connection :-
mongoose
  .connect(
    "mongodb+srv://apnamitra:Gr6JZ2CfHHSFN7Lm@cluster0.rsoo2.mongodb.net/ApnaDatabase?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("DB CONNECTED"); // ? Connection Successful
  })
  .catch((err) => {
    console.log("DB NOT CONNECTED"); // ! Error Handle
  });

//* Middelwares :-
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/todos", todosRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new httpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  // if (req.file) {
  //   fs.unlink(req.file.path, (err) => {
  //     console.log(err);
  //   });
  // }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.send({ message: error.message || "An unknown error occured!" });
});

//* Server Start
app.listen(port, () => {
  console.log(`Server is running at port ${port}...`);
});
