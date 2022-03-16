//* Imports :-
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const todosRoutes = require("./routes/todos-routes");
const authRoutes = require("./routes/auth");

//* Constants :-
const app = express();
const port = process.env.PORT || 8000;

//* Database Connection :-
mongoose
  .connect(
    process.env.Database,
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

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
//   next();
// });

//* Routes
app.use("/api", todosRoutes);
app.use("/api", authRoutes);

//* Server Start
app.listen(port, () => {
  console.log(`Server is running at port ${port}...`);
});
