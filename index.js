//* Imports :-
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//* Constants :-
const app = express();
const port = process.env.PORT || 8000;

//* Database Connection :-
// mongoose
//   .connect(process.env.DATABASE, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("DB CONNECTED"); // ? Connection Successful
//   })
//   .catch((err) => {
//     console.log("DB NOT CONNECTED"); // ! Error Handle
//   });

//* Middelwares :-
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//* Server Start
app.listen(port, () => {
    console.log(`Server is running at port ${port}...`);
  });