const express = require("express");
const { check } = require("express-validator");

const todosControllers = require("../controllers/todo-controller");

const router = express.Router();

router.get("/user/:uid", todosControllers.getTodosByUserId);

//... check-auth middleware

router.post("/", [check("name").not().isEmpty()], todosControllers.createTodo);

router.patch(
  "/:tid",
  [check("name").not().isEmpty()],
  todosControllers.updateTodo
);

router.delete("/:tid", todosControllers.deleteTodo);

module.exports = router;
