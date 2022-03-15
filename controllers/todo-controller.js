const { validationResult } = require("express-validator");

const mongoose = require("mongoose");

const Todo = require("../models/todo-list");
const User = require("../models/user");
const HttpError = require("../models/http-error");

const getTodosByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithTodos;
  try {
    userWithTodos = await User.findById(userId).populate("todos");
  } catch (err) {
    const error = new HttpError(
      "Fetching To-Do-List failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!userWithTodos) {
    const error = new HttpError(
      "Could not find any To-Do-List for the provided user id.",
      404
    );
    return next(error);
  }

  res.json({
    todos: userWithTodos.todos.map((todo) => todo.toObject({ getters: true })),
  });
};

const createTodo = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.")
    );
  }

  const { name, creator } = req.body;

  const createdTodo = new Todo({
    name,
    tasks: [],
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Creating To-Do-List failed, please try again."
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTodo.save({ session: sess });
    user.todos.push(createdTodo);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating to-do list failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    todo: createdTodo,
  });
};

const updateTodo = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.")
    );
  }

  const todoId = req.params.tid;
  const { name } = req.body;

  let todo;
  try {
    todo = await Todo.findById(todoId);
  } catch (err) {
    const error = new HttpError(
      "Could not fetch To-Do list, please try again later.",
      500
    );
    return next(error);
  }

  if (todo.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to edit this To-do list.",
      401
    );
    return next(error);
  }

  todo.name = name; //updating here

  //...update task here...

  try {
    await todo.save();
  } catch (err) {
    const error = new HttpError(
      "Could not update To-Do List, please try again later.",
      500
    );

    return next(error);
  }

  res.status(200).json({
    todo: todo.toObject({ getters: true }),
  });
};

const deleteTodo = async (req, res, next) => {
  const todoId = req.params.tid;

  let todo;
  try {
    todo = await Todo.findById(todoId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete to-do list.",
      500
    );
    return next(error);
  }

  if (!todo) {
    const error = new HttpError(
      "Could not find the to-do list for provided id.",
      404
    );
    return next(error);
  }

  if (todo.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this to-do list.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await todo.remove({ session: sess });
    todo.creator.todos.pull(todo);
    await todo.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete to-do list.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "To-Do list deleted." });
};

exports.getTodosByUserId = getTodosByUserId;
exports.createTodo = createTodo;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;
